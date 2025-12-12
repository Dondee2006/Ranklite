import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});

export const GROWTH_PLAN_PRICE = 9900;
export const GROWTH_PLAN_NAME = "Growth Plan";
