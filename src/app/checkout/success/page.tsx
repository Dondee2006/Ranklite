import SuccessClient from "./success-client";

// Force dynamic rendering so Next.js skips static pre-render
export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return <SuccessClient />;
}
