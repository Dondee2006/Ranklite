import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { calculateCreditValue } from "@/lib/backlink-engine/exchange-service";

export async function POST(req: Request) {
  try {
    // 1. Give initial credits to verified participants
    const { data: participants } = await supabaseAdmin
      .from('exchange_participants')
      .select('*')
      .eq('verification_status', 'verified');

    if (participants) {
      for (const p of participants) {
        // Base bonus based on DR
        const initialCredits = p.domain_rating * 0.5; // e.g. DR 60 = 30 credits
        
        await supabaseAdmin
          .from('exchange_participants')
          .update({ credits: initialCredits })
          .eq('id', p.id);

        // Log transaction
        await supabaseAdmin
          .from('exchange_transactions')
          .insert({
            participant_id: p.id,
            type: 'adjustment',
            amount: initialCredits,
            description: 'Migration: Initial credit balance based on DR'
          });
      }
    }

    // 2. Update existing links with default credit values
    const { data: links } = await supabaseAdmin
      .from('exchange_links')
      .select('*')
      .is('credit_value', null);

    if (links) {
      for (const link of links) {
        const source = participants?.find(p => p.id === link.source_participant_id);
        const earned = source ? await calculateCreditValue(source.domain_rating, 'earn') : 1.0;
        
        await supabaseAdmin
          .from('exchange_links')
          .update({ credit_value: earned })
          .eq('id', link.id);
      }
    }

    return NextResponse.json({ success: true, message: "Migration completed" });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
