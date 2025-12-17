import SuccessClient from "./success-client";

export const dynamic = "force-dynamic"; // Tell Next.js to skip prerendering

export default function CheckoutSuccessPage() {
  return <SuccessClient />;
}
