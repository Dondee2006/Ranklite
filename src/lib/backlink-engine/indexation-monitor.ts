import { supabaseAdmin } from "@/lib/supabase/admin";

export class IndexationMonitor {
  static async checkIndexation(backlinkId: string, url: string) {
    // In a real scenario, this would use a Google Index Checker API
    // For now, we simulate the logic
    const isIndexed = Math.random() > 0.35; // Target ~65% index rate

    await supabaseAdmin
      .from("backlinks")
      .update({
        is_indexed: isIndexed,
        last_index_check: new Date(),
      })
      .eq("id", backlinkId);

    if (!isIndexed) {
      await this.handleNonIndexed(backlinkId);
    }
  }

  private static async handleNonIndexed(backlinkId: string) {
    const { data: backlink } = await supabaseAdmin
      .from("backlinks")
      .select("*")
      .eq("id", backlinkId)
      .single();

    if (!backlink) return;

    // If a Tier 2 page is not indexed after X days, we might want to replace it
    const ageInDays = (new Date().getTime() - new Date(backlink.date_added).getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageInDays > 14 && backlink.tier === 2) {
      // Mark for replacement
      await supabaseAdmin
        .from("backlinks")
        .update({ status: "replaced" })
        .eq("id", backlinkId);
        
      // Fetch full campaign for replacement task
      const { data: campaign } = await supabaseAdmin
        .from("backlink_campaigns")
        .select("*")
        .eq("user_id", backlink.user_id)
        .single();

      // Get article if exists
      let article = null;
      if (backlink.article_id) {
        const { data } = await supabaseAdmin
          .from("articles")
          .select("*")
          .eq("id", backlink.article_id)
          .single();
        article = data;
      }

      // Self-Healing: Automatically trigger replacement
      const { TieredGenerator } = await import("./tiered-generator");
      await TieredGenerator.createBacklinkTask(
        backlink.user_id, 
        backlink.target_url, 
        2, 
        campaign || { risk_level: "Balanced", branded_terms: [], keywords: [] },
        article
      );
    }
  }

  static async getIndexStats(userId: string) {
    const { data: links } = await supabaseAdmin
      .from("backlinks")
      .select("is_indexed, tier")
      .eq("user_id", userId);

    if (!links) return { rate: 0, indexed: 0, total: 0 };

    const indexed = links.filter(l => l.is_indexed).length;
    const total = links.length;

    return {
      rate: total > 0 ? (indexed / total) * 100 : 0,
      indexed,
      total,
    };
  }
}
