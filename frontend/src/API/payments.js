// simple API wrapper with sensible defaults
export const PAYMENT_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1/payment";
export const SEARCH_BASE =
  import.meta.env.VITE_SEARCH_URL || "http://localhost:3000/api/v1/users/search";

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function searchUsers(q) {
  if (!q) return [];
  const url = `${SEARCH_BASE}?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function transferInternal({ fromAccountId, toUpiId, amountPaise, note }) {
  const res = await fetch(`${PAYMENT_BASE}/transfer`, {
    method: "POST",
    headers: authHeaders({ "Idempotency-Key": crypto.randomUUID() }),
    body: JSON.stringify({ fromAccountId, toUpiId, amountPaise, note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Transfer failed");
  return data;
}

export async function externalUPIPayment({ fromAccountId, payeeUpiId, amountPaise, note }) {
  const res = await fetch(`${PAYMENT_BASE}/externalPayment`, {
    method: "POST",
    headers: authHeaders({ "Idempotency-Key": crypto.randomUUID() }),
    body: JSON.stringify({
      fromAccountId,
      method: "upi",
      payee: payeeUpiId, // backend expects 'payee'
      amountPaise,
      note,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "External payment failed");
  return data;
}
