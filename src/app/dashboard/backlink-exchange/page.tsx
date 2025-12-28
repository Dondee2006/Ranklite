"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Link2,
  Globe,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  ExternalLink,
  Lock,
  ArrowRight,
  RefreshCw,
  Trophy,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Site {
  id: string;
  name: string;
  website_url: string;
}

interface Participant {
  id: string;
  verification_status: 'pending' | 'verified' | 'failed';
  verification_method: 'meta_tag' | 'dns_record' | 'api';
  verification_token: string;
  domain_rating: number;
  monthly_traffic: number;
  niche: string;
  site: Site;
  credits: number;
  min_dr_preference: number;
  min_traffic_preference: number;
  niche_preference: string[];
}

interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'adjustment' | 'purchase';
  amount: number;
  description: string;
  created_at: string;
}

export default function BacklinkExchangePage() {
  console.log("MARKETPLACE V2 LOADED");
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [inboundLinks, setInboundLinks] = useState<any[]>([]);
  const [outboundLinks, setOutboundLinks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [hasIntegration, setHasIntegration] = useState(false);

  // ... (existing state)

  const loadData = async () => {
    try {
      const [statsRes, sitesRes, integrationsRes] = await Promise.all([
        fetch("/api/backlinks/exchange/stats"),
        fetch("/api/sites"),
        fetch("/api/cms/integrations") // Check for active integrations
      ]);

      const statsData = await statsRes.json();
      const sitesData = await sitesRes.json();
      const integrationsData = await integrationsRes.json();

      setParticipant(statsData.participant);
      setInboundLinks(statsData.inboundLinks || []);
      setOutboundLinks(statsData.outboundLinks || []);
      setTransactions(statsData.transactions || []);
      setStats(statsData.stats);

      // Handle both { sites: [...] } and { site: {...} } responses
      if (sitesData.sites) {
        setSites(sitesData.sites);
      } else if (sitesData.site) {
        setSites([sitesData.site]);
      } else {
        setSites([]);
      }

      // Check integration status
      if (integrationsData.integrations && integrationsData.integrations.length > 0) {
        setHasIntegration(true);
      } else {
        setHasIntegration(false);
      }

      setIsAdmin(statsData.is_super_admin || false);

      if (statsData.participant) {
        setPrefs({
          min_dr_preference: statsData.participant.min_dr_preference || 0,
          min_traffic_preference: statsData.participant.min_traffic_preference || 0,
          niche_preference: statsData.participant.niche_preference || []
        });
      }
    } catch (error) {
      console.error("Failed to load exchange data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ... (handlers)

  useEffect(() => {
    loadData();
  }, []);

  // ... (handleJoin, handleVerify)

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-8">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <Trophy className="h-6 w-6 text-yellow-500" />
            Backlink Exchange
          </h1>
          <p className="text-[#6B7280] mt-1">Earn credits by linking, spend to grow your authority.</p>
        </div>
        {participant && (
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                href="/dashboard/backlink-exchange/admin"
                className="text-xs bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
            <div className="bg-white px-4 py-2 rounded-lg border border-[#E5E5E5] shadow-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-[#1A1A1A]">{participant.credits.toFixed(1)} Credits</span>
            </div>
          </div>
        )}
        {!participant && (
          <button
            onClick={() => document.getElementById('join-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#22C55E] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#16A34A] transition-all flex items-center gap-2 shadow-md shadow-green-500/10"
          >
            <Plus className="h-4 w-4" />
            Join Network
          </button>
        )}
      </header>

      {participant ? (
        <div className="space-y-6">

          {/* Warning Banner */}
          {!hasIntegration && (
            <div className="bg-[#FFF4ED] border border-[#FFDCCB] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-[#FF8A4C]/10 rounded-full p-2 mt-1">
                  <AlertCircle className="h-5 w-5 text-[#FF8A4C]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                    Website integration required
                    <span className="text-xs font-normal text-[#6B7280]">• Backlink Exchange will be disabled and you won't receive backlinks from other websites until you integrate your website</span>
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/integrations"
                className="bg-[#FF8A4C]/10 text-[#FF8A4C] border border-[#FF8A4C]/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#FF8A4C]/20 transition-colors whitespace-nowrap"
              >
                Setup Integration
              </Link>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase">Available Credits</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{participant.credits.toFixed(1)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase">Links Provided</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{stats?.totalProvided || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase">Your DR</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{participant.domain_rating}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center" title="Site Traffic">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase">Site Traffic</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{participant.monthly_traffic >= 1000 ? (participant.monthly_traffic / 1000).toFixed(0) + 'K+' : participant.monthly_traffic}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preferences Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="mt-0 rounded-xl border border-green-200 bg-green-50 p-6">
                <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#22C55E]" />
                  Link Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] uppercase mb-1.5">Minimum DR</label>
                    <input
                      type="number"
                      className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg p-2 text-sm"
                      value={prefs.min_dr_preference}
                      onChange={(e) => setPrefs({ ...prefs, min_dr_preference: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] uppercase mb-1.5">Min Monthly Traffic</label>
                    <input
                      type="number"
                      className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg p-2 text-sm"
                      value={prefs.min_traffic_preference}
                      onChange={(e) => setPrefs({ ...prefs, min_traffic_preference: parseInt(e.target.value) })}
                    />
                  </div>
                  <button
                    onClick={handleUpdatePrefs}
                    disabled={savingPrefs}
                    className="w-full bg-[#1A1A1A] text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
                  >
                    {savingPrefs && <Loader2 className="h-4 w-4 animate-spin text-[#22C55E]" />}
                    Save Preferences
                  </button>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E5E5E5]">
                  <h3 className="font-semibold text-[#1A1A1A] text-sm">Recent Activity</h3>
                </div>
                <div className="divide-y divide-[#E5E5E5]">
                  {transactions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#6B7280]">No recent transactions</div>
                  ) : (
                    transactions.map((t) => (
                      <div key={t.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-[#1A1A1A]">{t.description}</p>
                          <p className="text-[10px] text-[#6B7280]">{new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={cn(
                          "text-xs font-bold",
                          t.amount > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {t.amount > 0 ? "+" : ""}{t.amount.toFixed(1)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Links Tables Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Links Tables */}
              <div className="space-y-6">
                {/* Inbound Links */}
                <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
                    <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#22C55E]" />
                      Links You Received
                    </h3>
                    <span className="text-xs font-medium text-[#22C55E] bg-green-50 px-2 py-1 rounded-full">{inboundLinks.length} Links</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#F9FAFB] text-xs font-medium text-[#6B7280] uppercase">
                        <tr>
                          <th className="px-6 py-3">Source Site</th>
                          <th className="px-6 py-3">Anchor Text</th>
                          <th className="px-6 py-3">DR</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {inboundLinks.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-[#6B7280] text-sm">
                              No links earned yet. Verification required.
                            </td>
                          </tr>
                        ) : (
                          inboundLinks.map((link: any) => (
                            <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-[#1A1A1A] truncate max-w-[150px]">{link.source?.site.name || 'Partner Site'}</span>
                                  <a href={link.linking_url} target="_blank" className="text-[#22C55E]"><ExternalLink className="h-3 w-3" /></a>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-[#6B7280]">{link.anchor_text}</td>
                              <td className="px-6 py-4 text-sm text-[#6B7280]">{link.source?.domain_rating || '-'}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded">Active</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Outbound Links */}
                <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
                    <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-green-600" />
                      Links You Provided
                    </h3>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{outboundLinks.length} Links</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#F9FAFB] text-xs font-medium text-[#6B7280] uppercase">
                        <tr>
                          <th className="px-6 py-3">Target Site</th>
                          <th className="px-6 py-3">Credits Earned</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {outboundLinks.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-[#6B7280] text-sm">
                              No links provided yet.
                            </td>
                          </tr>
                        ) : (
                          outboundLinks.map((link: any) => (
                            <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-[#1A1A1A] truncate max-w-[150px]">{link.target?.site.name}</span>
                                  <a href={link.target_url} target="_blank" className="text-[#22C55E]"><ExternalLink className="h-3 w-3" /></a>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-green-600">+{link.credit_value || 1.0}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded">Active</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div id="join-form" className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-[#22C55E] text-xs font-bold uppercase tracking-wider mb-4">
                  <Zap className="h-3 w-3" />
                  Now Available
                </div>
                <h2 className="text-3xl font-bold text-[#1A1A1A]">Automate Your Link Building</h2>
                <p className="text-[#6B7280] mt-4 text-lg">
                  Join our exclusive network of high-authority SaaS and Technology platforms. Share links automatically and grow your SEO rankings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1A1A1A]">Ownership Verification</h4>
                      <p className="text-sm text-[#6B7280] mt-1">Verify via Meta tag or DNS to ensure network safety.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-50 text-[#22C55E] flex items-center justify-center shrink-0">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1A1A1A]">Authority Check</h4>
                      <p className="text-sm text-[#6B7280] mt-1">Minimum DR 20+ and 1,000 monthly traffic required.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1A1A1A]">Secure & Automated</h4>
                      <p className="text-sm text-[#6B7280] mt-1">Automatic link placement via secure CMS API.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E5E5] p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Select Your Site</label>
                    <select
                      className="w-full bg-white border border-[#E5E5E5] rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500/10 transition-all text-sm"
                      value={formData.site_id}
                      onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                    >
                      <option value="">Select a site...</option>
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>
                          {site.name || (site as any).url || site.website_url || 'Unnamed Site'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Verification Method</label>
                    <select
                      className="w-full bg-white border border-[#E5E5E5] rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500/10 transition-all text-sm"
                      value={formData.verification_method}
                      onChange={(e) => setFormData({ ...formData, verification_method: e.target.value })}
                    >
                      <option value="meta_tag">Meta Tag (Recommended)</option>
                      <option value="dns_record">DNS Record</option>
                      <option value="api">CMS Integration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Your Niche</label>
                    <select
                      className="w-full bg-white border border-[#E5E5E5] rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#22C55E]/10 focus:border-[#22C55E] transition-all text-sm"
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                    >
                      <option value="Technology">Technology</option>
                      <option value="SaaS">SaaS</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Finance">Finance</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={joining || !formData.site_id}
                    className="w-full bg-[#22C55E] text-white py-3 rounded-xl font-bold hover:bg-[#16A34A] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
                  >
                    {joining ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Eligibility & Join"}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <p className="text-[10px] text-[#6B7280] text-center italic">
                    By joining, you agree to provide automated backlink placements on your site for other verified high-authority members.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
