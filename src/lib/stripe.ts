import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2024-06-20", // Updated to a valid recent version or keep existing if known valid
  typescript: true,
});

export const GROWTH_PLAN_PRICE = 9900;
export const GROWTH_PLAN_NAME = "Growth Plan";
