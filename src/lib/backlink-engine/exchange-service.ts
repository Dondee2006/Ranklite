import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

export interface ExchangeParticipant {
  id: string;
  user_id: string;
  site_id: string;
  domain_rating: number;
  monthly_traffic: number;
  niche: string;
  verification_status: 'pending' | 'verified' | 'failed';
  verification_method: 'meta_tag' | 'dns_record' | 'api';
  verification_token: string;
  is_active: boolean;
  auto_exchange_enabled: boolean;
  credits: number;
  min_dr_preference: number;
  min_traffic_preference: number;
  niche_preference: string[];
  last_linked_at?: string;
  daily_link_count: number;
  last_reset_at: string;
}

export async function generateVerificationToken(): Promise<string> {
  return crypto.randomBytes(16).toString('hex');
}

export async function getCreditConfig() {
  const { data: config } = await supabaseAdmin
    .from('exchange_config')
    .select('*')
    .order('dr_min', { ascending: true });
  return config || [];
}

export async function calculateCreditValue(dr: number, type: 'earn' | 'spend'): Promise<number> {
  const config = await getCreditConfig();
  const tier = config.find(c => dr >= c.dr_min && dr <= c.dr_max);
  if (!tier) return type === 'earn' ? 1 : 1.5;
  return type === 'earn' ? Number(tier.credit_price_earn) : Number(tier.credit_cost_spend);
}

export async function processTransaction(
  participantId: string, 
  amount: number, 
  type: 'earn' | 'spend' | 'adjustment' | 'purchase',
  linkId?: string,
  description?: string
) {
  const { data: participant } = await supabaseAdmin
    .from('exchange_participants')
    .select('credits')
    .eq('id', participantId)
    .single();

  if (!participant) throw new Error('Participant not found');

  const newBalance = Number(participant.credits) + amount;

  const { error: updateError } = await supabaseAdmin
    .from('exchange_participants')
    .update({ credits: newBalance })
    .eq('id', participantId);

  if (updateError) throw updateError;

  const { error: transError } = await supabaseAdmin
    .from('exchange_transactions')
    .insert({
      participant_id: participantId,
      link_id: linkId,
      type,
      amount,
      description
    });

  if (transError) throw transError;
  
  return newBalance;
}

export async function findBestMatch(participantId: string): Promise<{ id: string, cost: number, score: number } | null> {
  const { data: source } = await supabaseAdmin
    .from('exchange_participants')
    .select('*, site:sites(*)')
    .eq('id', participantId)
    .single();

  if (!source || !source.is_active || source.verification_status !== 'verified') return null;

  // 1. Get potential targets
  const { data: targets } = await supabaseAdmin
    .from('exchange_participants')
    .select('*, site:sites(*)')
    .neq('id', participantId)
    .eq('is_active', true)
    .eq('verification_status', 'verified')
    .gte('domain_rating', source.min_dr_preference || 0)
    .gte('monthly_traffic', source.min_traffic_preference || 0);

  if (!targets || targets.length === 0) return null;

  const candidates: { id: string, cost: number, score: number }[] = [];
  const now = new Date();

  for (const target of targets) {
    // 2. Daily reset & velocity logic
    let targetDailyCount = target.daily_link_count || 0;
    const lastReset = target.last_reset_at ? new Date(target.last_reset_at) : new Date(0);
    
    if (now.toDateString() !== lastReset.toDateString()) {
      targetDailyCount = 0;
    }

    if (targetDailyCount >= 2) continue; // Max 2 links per day (natural velocity)

    // 3. Loop avoidance: check if target already links to source (direct reciprocal)
    const { data: existingReverse } = await supabaseAdmin
      .from('exchange_links')
      .select('id')
      .eq('source_participant_id', target.id)
      .eq('target_participant_id', source.id)
      .maybeSingle();

    if (existingReverse) continue;

    // 4. Prevent duplicate links A -> B
    const { data: existingForward } = await supabaseAdmin
      .from('exchange_links')
      .select('id')
      .eq('source_participant_id', source.id)
      .eq('target_participant_id', target.id)
      .maybeSingle();

    if (existingForward) continue;

    // 5. Calculate credit cost for source to get this link
    const cost = await calculateCreditValue(target.domain_rating, 'spend');
    if (source.credits < cost) continue;

    // 6. Scoring model
    const topicality = source.niche === target.niche ? 1 : 0.2;
    const drScore = target.domain_rating / 100;
    const trafficScore = Math.min(target.monthly_traffic / 100000, 1);
    
    // Diversity / Rotation factor (bonus for sites that haven't linked recently)
    const lastLinked = target.last_linked_at ? new Date(target.last_linked_at).getTime() : 0;
    const hoursSinceLastLink = (now.getTime() - lastLinked) / (1000 * 60 * 60);
    const rotationBonus = Math.min(hoursSinceLastLink / 24, 1); // Bonus caps at 24 hours

    const score = (topicality * 0.4) + (drScore * 0.2) + (trafficScore * 0.2) + (rotationBonus * 0.2);

    candidates.push({ id: target.id, cost, score });
  }

  if (candidates.length === 0) return null;

  return candidates.sort((a, b) => b.score - a.score)[0];
}

export async function verifyOwnership(participantId: string): Promise<boolean> {
  const { data: participant, error } = await supabaseAdmin
    .from('exchange_participants')
    .select('*, site:sites(*)')
    .eq('id', participantId)
    .single();

  if (error || !participant) return false;

  const { verification_method, verification_token, site } = participant;
  const websiteUrl = site.website_url || site.url;

  if (!websiteUrl) return false;

  if (verification_method === 'meta_tag') {
    return verifyMetaTag(websiteUrl, verification_token);
  } else if (verification_method === 'dns_record') {
    return verifyDNSRecord(websiteUrl, verification_token);
  } else if (verification_method === 'api') {
    return verifyCMSIntegration(participant.user_id, participant.site_id);
  }

  return false;
}

async function verifyMetaTag(url: string, token: string): Promise<boolean> {
  try {
    let targetUrl = url;
    
    // Handle local development verification
    if (process.env.NODE_ENV === 'development') {
      const urlObj = new URL(url);
      const siteUrlObj = new URL(process.env.SITE_URL || 'http://localhost:3000');
      
      if (urlObj.hostname.includes(siteUrlObj.hostname) || siteUrlObj.hostname.includes(urlObj.hostname)) {
        console.log('[DEV] Bypassing meta tag check for local development');
        return true;
      }
    }

    const response = await fetch(targetUrl);
    if (!response.ok) return false;
    const html = await response.text();
    const metaPattern = new RegExp(`<meta name=["']ranklite-verification["'] content=["']${token}["']`, 'i');
    return metaPattern.test(html);
  } catch (error) {
    console.error('Meta tag verification failed:', error);
    return false;
  }
}

async function verifyDNSRecord(url: string, token: string): Promise<boolean> {
  try {
    const domain = new URL(url).hostname;
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
    if (!response.ok) return false;
    const data = await response.json();
    const records = data.Answer || [];
    return records.some((r: any) => r.data.includes(`ranklite-verification=${token}`));
  } catch (error) {
    console.error('DNS verification failed:', error);
    return false;
  }
}

async function verifyCMSIntegration(userId: string, siteId: string): Promise<boolean> {
  const { data: integration } = await supabaseAdmin
    .from('cms_integrations')
    .select('id')
    .eq('user_id', userId)
    .eq('site_id', siteId)
    .maybeSingle();

  return !!integration;
}

export async function validateSiteMetrics(url: string): Promise<{ dr: number, traffic: number }> {
  const domain = new URL(url).hostname;
  
  // Default metrics for new/small sites that join the network
  // We set them slightly above minimums so they can actually participate
  let dr = Math.floor(Math.random() * 15) + 25; // Random DR between 25-40
  let traffic = Math.floor(Math.random() * 2000) + 1200; // Random traffic between 1200-3200

  const highAuthorityDomains = ['techcrunch.com', 'forbes.com', 'medium.com', 'github.com', 'producthunt.com'];
  if (highAuthorityDomains.some(d => domain.includes(d)) || domain.endsWith('.edu') || domain.endsWith('.gov')) {
    dr = 85;
    traffic = 500000;
  } else if (domain.includes('saas') || domain.includes('app') || domain.includes('blog') || domain.includes('tech')) {
    dr = Math.floor(Math.random() * 20) + 50; // 50-70
    traffic = Math.floor(Math.random() * 10000) + 15000; // 15k-25k
  }

  return { dr, traffic };
}
