"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Payment Successful!</h1>
      {sessionId ? (
        <p>Your session ID: <strong>{sessionId}</strong></p>
      ) : (
        <p>No session ID found.</p>
      )}
    </div>
  );
}
