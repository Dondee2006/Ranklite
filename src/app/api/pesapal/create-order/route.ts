import { NextRequest, NextResponse } from 'next/server';

/**
 * Pesapal Create Order Route
 * Path: /api/pesapal/create-order
 * 
 * This route handles the creation of a Pesapal order.
 * 1. Authenticates with Pesapal to get an OAuth token.
 * 2. Submits an order request to Pesapal.
 * 3. Returns the redirect URL to the frontend.
 */

// Pesapal Environment Configuration
// Use 'https://cybqa.pesapal.com/pesapalv3' for Sandbox/Test
// Use 'https://pay.pesapal.com/v3' for Production
const PESAPAL_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';

// Helper to get OAuth Token
async function getPesapalAccessToken() {
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        throw new Error("Missing Pesapal credentials");
    }

<<<<<<< HEAD
    const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
=======
    const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/GetNotificationId`, {
>>>>>>> 7504f29 (Implement Pesapal payments for  trial)
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get access token: ${errorText}`);
    }

    const data = await response.json();
    return data.token; // The Bearer token
}

export async function GET(request: NextRequest) {
    return NextResponse.json({ message: "Pesapal Create Order route is ready" });
}

export async function POST(request: NextRequest) {
    try {
        const { user_id, email, name, description, amount = 1.00 } = await request.json();

        if (!user_id || !email) {
            return NextResponse.json({ error: "Missing required fields (user_id, email)" }, { status: 400 });
        }

        // 1. Get Access Token
        const token = await getPesapalAccessToken();

        // 2. Prepare Order Request
        // Unique ID for this specific transaction attempt
        const merchantReference = `${user_id}-${Date.now()}`;
        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/overview?payment_success=true`;
        const notificationId = process.env.PESAPAL_IPN_ID;

        if (!notificationId) {
            console.warn("PESAPAL_IPN_ID is missing. IPN callback will not work without it.");
        }

        const orderPayload = {
            id: merchantReference,
            currency: "USD",
            amount: amount,
            description: description || "Ranklite Pro Trial Activation",
            callback_url: callbackUrl,
            notification_id: notificationId,
            billing_address: {
                email_address: email,
                country_code: "US", // Defaulting to US for simplicity, can be dynamic
                first_name: name?.split(' ')[0] || "Valued",
                last_name: name?.split(' ')[1] || "Customer",
            },
        };

        // 3. Submit Order
        const submitResponse = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderPayload),
        });

        if (!submitResponse.ok) {
            const errorData = await submitResponse.text();
            console.error("Pesapal SubmitOrder Error:", errorData);
            throw new Error(`Failed to submit order: ${errorData}`);
        }

        const orderData = await submitResponse.json();

        // orderData typically contains { order_tracking_id, merchant_reference, redirect_url, status, ... }
        return NextResponse.json({
            redirect_url: orderData.redirect_url,
            tracking_id: orderData.order_tracking_id
        });

    } catch (error: unknown) {
        console.error("Create Order Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
