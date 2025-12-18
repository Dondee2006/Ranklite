import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Pesapal IPN Listener Route
 * Path: /api/pesapal/ipn
 * 
 * This route listens for Instant Payment Notifications (IPN) from Pesapal.
 * It logs the payload and query parameters for debugging purposes.
 */

const PESAPAL_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';

// Helper to get OAuth Token (Duplicated from create-order for independence)
async function getPesapalAccessToken() {
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) throw new Error("Missing Pesapal credentials");

    const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
    });

    if (!response.ok) throw new Error(`Failed to get access token`);
    const data = await response.json();
    return data.token;
}

export async function GET(request: NextRequest) {
    // Simple check to verify the listener is alive
    return NextResponse.json({ message: "Pesapal IPN listener alive" });
}

export async function POST(request: NextRequest) {
    try {
        console.log('[Pesapal IPN] Notification Received');
        const searchParams = Object.fromEntries(request.nextUrl.searchParams);
        const orderTrackingId = searchParams.OrderTrackingId;
        const orderNotificationType = searchParams.OrderNotificationType;

        console.log('[Pesapal IPN] Params:', searchParams);

        if (orderTrackingId && orderNotificationType) {
            // 1. Authenticate
            const token = await getPesapalAccessToken();

            // 2. Get Transaction Status
            const statusResponse = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log('[Pesapal IPN] Transaction Status:', statusData);

                // { payment_status_description: "Completed", merchant_reference: "USERID-TIMESTAMP", ... }
                if (statusData.payment_status_description === 'Completed') {
                    const merchantReference = statusData.merchant_reference;
                    const userId = merchantReference.split('-')[0]; // Extract USERID

                    if (userId) {
                        console.log(`[Pesapal IPN] Activating trial for user: ${userId}`);

                        const trialStart = new Date();
                        const trialEnd = new Date();
                        trialEnd.setDate(trialEnd.getDate() + 3); // 3 Days Trial

                          // 3. Update Supabase
                          const { error } = await supabaseAdmin
                              .from('user_plans')
                              .upsert({
                                  user_id: userId,
                                  plan_id: 'free_trial',
                                  status: 'active',
                                  current_period_start: trialStart.toISOString(),
                                  current_period_end: trialEnd.toISOString(),
                                  // valid_until: trialEnd.toISOString() // if needed
                              }, { onConflict: 'user_id' });


                        if (error) {
                            console.error('[Pesapal IPN] Database Update Error:', error);
                        } else {
                            console.log('[Pesapal IPN] Trial Activated Successfully');
                        }
                    }
                }
            } else {
                console.error('[Pesapal IPN] Failed to verify transaction status');
            }
        }

        // 4. Respond immediately to confirm receipt
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('[Pesapal IPN] Error:', error);

        // Return 500 if something critical failed, though typically you want to acknowledge receipt
        // to stop Pesapal from retrying if it's a logic error on your end that won't be fixed by retrying.
        return NextResponse.json(
            { received: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
