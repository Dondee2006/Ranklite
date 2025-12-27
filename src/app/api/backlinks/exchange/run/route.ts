import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { findBestMatch, calculateCreditValue, processTransaction } from "@/lib/backlink-engine/exchange-service";
import { placeBacklink } from "@/lib/backlink-engine/placement-service";

export async function POST(req: Request) {
  try {
    // 1. Fetch all verified and active participants
    const { data: participants, error: participantsError } = await supabaseAdmin
      .from('exchange_participants')
      .select('*, site:sites(*)')
      .eq('verification_status', 'verified')
      .eq('is_active', true)
      .eq('auto_exchange_enabled', true);

    if (participantsError || !participants || participants.length < 2) {
      return NextResponse.json({ 
        success: false, 
        message: "Not enough participants to run exchange (minimum 2 verified participants required)" 
      });
    }

    const results = [];

    // 2. Process each participant to find and place a link
    for (const source of participants) {
      // Find a suitable target site based on credits and scoring
      const match = await findBestMatch(source.id);
      if (!match) continue;

      const target = participants.find(p => p.id === match.id);
      if (!target || !target.site) continue;

      // 3. Place the link on the source site pointing to the target site
      const placementResult = await placeBacklink(
        source.site_id,
        target.site.website_url,
        target.site.name || target.site.website_url
      );

      if (placementResult.success) {
        // 4. Calculate credits earned and spent
        const earned = await calculateCreditValue(source.domain_rating, 'earn');
        const spent = match.cost;

        // 5. Record the successfully placed link in the database
        const { data: link, error: linkError } = await supabaseAdmin
          .from('exchange_links')
          .insert({
            source_participant_id: source.id,
            target_participant_id: target.id,
            linking_url: placementResult.linkingUrl,
            target_url: target.site.website_url,
            anchor_text: target.site.name || target.site.website_url,
            status: 'active',
            last_verified_at: new Date().toISOString(),
            credit_value: earned,
            scoring_metrics: {
              source_dr: source.domain_rating,
              target_dr: target.domain_rating,
              score: match.score,
              niche: source.niche,
              target_niche: target.niche
            }
          })
          .select()
          .single();

        if (linkError) {
          console.error('Failed to record exchange link:', linkError);
          continue;
        }

        // 6. Process Transactions
        // Source EARNS credits for providing a link
        await processTransaction(
          source.id,
          earned,
          'earn',
          link.id,
          `Earned credits for linking to ${target.site.website_url}`
        );

        // Source SPENDS credits for receiving a link (the match logic ensures they have enough)
        // Note: In this loop, 'source' is the one providing the link. 
        // The one receiving the link (target) should spend the credits.
        await processTransaction(
          target.id,
          -spent,
          'spend',
          link.id,
          `Spent credits for link from ${source.site.website_url}`
        );

        // 7. Update velocity metrics
        const now = new Date();
        const targetDailyCount = (target.daily_link_count || 0) + 1;
        
        await supabaseAdmin
          .from('exchange_participants')
          .update({ 
            last_linked_at: now.toISOString(),
            daily_link_count: targetDailyCount,
            last_reset_at: targetDailyCount === 1 ? now.toISOString() : target.last_reset_at
          })
          .eq('id', target.id);

        results.push({ 
          source: source.site.website_url, 
          target: target.site.website_url, 
          status: 'success',
          linking_url: placementResult.linkingUrl,
          credits_earned: earned,
          credits_spent: spent
        });
      } else {
        results.push({ 
          source: source.site.website_url, 
          target: target.site.website_url, 
          status: 'failed', 
          error: placementResult.error 
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed_count: results.length,
      results 
    });

  } catch (error) {
    console.error('Backlink exchange run failed:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
