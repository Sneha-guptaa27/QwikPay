// QwikPayBasic.jsx
// Minimal React + Tailwind UI for money transfer.
// - Internal transfer to QwikPay users (search by name/UPI/phone -> picks their upiId)
// - External payment to non-QwikPay users via UPI ID (uses /externalPayment with method="upi")
// - INR → paise conversion, optional idempotency header, simple responses
// Adjust API_BASE and SEARCH_URL to your backend paths.

import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/payments";
const SEARCH_URL = import.meta.env.VITE_SEARCH_URL || "/api/users/search"; // <-- change if different

// helpers
const rupeesToPaise = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const cleaned = String(val).replace(/,/g, "").trim();
  if (cleaned === "") return 0;
  const num = Number(cleaned);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
};
const uuidv4 = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
const pretty = (obj) => JSON.stringify(obj, null, 2);

// tiny atoms
const Label = (p) => (
  <label {...p} className={`block text-sm font-medium mb-1 ${p.className || ""}`} />
);
const Input = ({ value, onChange, type = "text", placeholder, ...rest }) => (
  <input
    {...rest}
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full rounded-md border px-3 py-2 bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none ${rest.className || ""}`}
  />
);
const Button = ({ children, onClick, disabled, variant = "primary", ...rest }) => {
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium";
  const styles =
    variant === "ghost"
      ? "border border-gray-300 text-gray-800 bg-white hover:bg-gray-50"
      : "bg-indigo-600 text-white hover:bg-indigo-500";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles} disabled:opacity-50`} {...rest}>
      {children}
    </button>
  );
};
const Card = ({ title, children }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    {title ? <h3 className="text-base font-semibold mb-3">{title}</h3> : null}
    {children}
  </div>
);

export default function PaymentPage() {
  // common
  const [fromAccountId, setFromAccountId] = useState(""); // your logged-in user's Account._id
  const [useIdem, setUseIdem] = useState(true);
  const [idemKey, setIdemKey] = useState(uuidv4());

  const headers = useMemo(() => {
    const h = { "Content-Type": "application/json" };
    if (useIdem && idemKey) h["idempotency-key"] = idemKey;
    return h;
  }, [useIdem, idemKey]);

  const lastReqRef = useRef(null);

  // INTERNAL TRANSFER (search QwikPay users)
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // {firstName, upiId, phone, ...}

  const [inAmount, setInAmount] = useState("");
  const [inNote, setInNote] = useState("");
  const [inLoading, setInLoading] = useState(false);
  const [inRes, setInRes] = useState(null);
  const [inErr, setInErr] = useState(null);

  // EXTERNAL PAYMENT (UPI ID)
  const [extUpi, setExtUpi] = useState("");
  const [extAmount, setExtAmount] = useState("");
  const [extNote, setExtNote] = useState("");
  const [extLoading, setExtLoading] = useState(false);
  const [extRes, setExtRes] = useState(null);
  const [extErr, setExtErr] = useState(null);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // fetch search
  useEffect(() => {
    const run = async () => {
      if (!debouncedQ || debouncedQ.length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        // Expected response: [{ _id, firstName, upiId, phone, ... }]
        const res = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(debouncedQ)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : data?.results || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    };
    run();
  }, [debouncedQ]);

  const selectUser = (u) => {
    setSelectedUser(u);
    setQ(`${u.firstName || ""}${u.upiId ? ` — ${u.upiId}` : ""}${u.phone ? ` — ${u.phone}` : ""}`);
  };

  // internal transfer submit
  const submitInternal = async () => {
    setInErr(null);
    setInRes(null);
    const toUpiId = selectedUser?.upiId;
    const amountPaise = rupeesToPaise(inAmount);

    if (!fromAccountId) return setInErr({ error: "fromAccountId is required" });
    if (!toUpiId) return setInErr({ error: "Select a QwikPay user (needs upiId)" });
    if (amountPaise <= 0) return setInErr({ error: "Enter a valid amount (> 0)" });

    setInLoading(true);
    try {
      const url = `${API_BASE.replace(/\/$/, "")}/transfer`;
      const req = {
        method: "POST",
        headers,
        body: JSON.stringify({
          fromAccountId,
          toUpiId,
          amountPaise,
          note: inNote || undefined,
        }),
      };
      lastReqRef.current = { url, req, kind: "internal" };
      const res = await fetch(url, req);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setInRes(data);
    } catch (e) {
      setInErr({ error: e.message });
    } finally {
      setInLoading(false);
    }
  };

  // external payment submit
  const submitExternal = async () => {
    setExtErr(null);
    setExtRes(null);
    const amountPaise = rupeesToPaise(extAmount);

    if (!fromAccountId) return setExtErr({ error: "fromAccountId is required" });
    if (!extUpi) return setExtErr({ error: "UPI ID is required" });
    if (amountPaise <= 0) return setExtErr({ error: "Enter a valid amount (> 0)" });

    setExtLoading(true);
    try {
      const url = `${API_BASE.replace(/\/$/, "")}/externalPayment`;
      const req = {
        method: "POST",
        headers,
        body: JSON.stringify({
          fromAccountId,
          method: "upi",
          payee: extUpi, // controller stores payee as name; we pass UPI string
          amountPaise,
          note: extNote || undefined,
        }),
      };
      lastReqRef.current = { url, req, kind: "external" };
      const res = await fetch(url, req);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setExtRes(data);
    } catch (e) {
      setExtErr({ error: e.message });
    } finally {
      setExtLoading(false);
    }
  };

  const retryLast = async () => {
    if (!lastReqRef.current) return;
    const { url, req, kind } = lastReqRef.current;
    try {
      const res = await fetch(url, req);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Request failed");
      if (kind === "internal") setInRes(data);
      else setExtRes(data);
    } catch (e) {
      if (kind === "internal") setInErr({ error: e.message });
      else setExtErr({ error: e.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold">QwikPay – Basic Money Transfer</h1>
          <p className="text-sm text-gray-600">Send to QwikPay users (internal) or external UPI IDs.</p>
        </header>

        {/* Common config */}
        <Card title="Common">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="from">From Account ID</Label>
              <Input id="from" value={fromAccountId} onChange={setFromAccountId} placeholder="Your Account._id" />
            </div>
            <div className="flex items-end gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={useIdem} onChange={(e) => setUseIdem(e.target.checked)} />
                Send idempotency-key header
              </label>
              <Button variant="ghost" onClick={() => setIdemKey(uuidv4())}>New key</Button>
            </div>
            <div>
              <Label htmlFor="idem">Idempotency Key</Label>
              <Input id="idem" value={idemKey} onChange={setIdemKey} />
            </div>
          </div>
        </Card>

        {/* Internal transfer */}
        <Card title="Internal Transfer (to QwikPay user)">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="search">Search user (name / upi / phone)</Label>
                <Input
                  id="search"
                  value={q}
                  onChange={setQ}
                  placeholder="e.g. 'Aman' or 'aman@qwikpay' or '98765...'"
                />
                {searching ? <p className="text-xs text-gray-500 mt-1">Searching...</p> : null}
              </div>
              {Boolean(results?.length) && (
                <ul className="border border-gray-200 rounded-md divide-y max-h-48 overflow-auto">
                  {results.map((u) => (
                    <li
                      key={u._id || `${u.upiId}-${u.phone}`}
                      className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedUser?._id === u._id ? "bg-gray-100" : ""}`}
                      onClick={() => selectUser(u)}
                    >
                      <div className="text-sm font-medium">{u.firstName || u.name || "(no name)"}</div>
                      <div className="text-xs text-gray-600">
                        {u.upiId ? `UPI: ${u.upiId}` : "No UPI"} {u.phone ? `• Ph: ${u.phone}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {selectedUser && (
                <div className="text-sm text-gray-700">
                  Selected: <span className="font-semibold">{selectedUser.firstName || selectedUser.name}</span>{" "}
                  {selectedUser.upiId ? `• ${selectedUser.upiId}` : ""}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="amountInt">Amount (₹)</Label>
                <Input id="amountInt" type="number" value={inAmount} onChange={setInAmount} placeholder="100.00" />
                <p className="text-xs text-gray-600 mt-1">Paise: {rupeesToPaise(inAmount)}</p>
              </div>
              <div>
                <Label htmlFor="noteInt">Note (optional)</Label>
                <Input id="noteInt" value={inNote} onChange={setInNote} placeholder="For lunch" />
              </div>
              <div className="flex gap-2">
                <Button onClick={submitInternal} disabled={inLoading}>
                  {inLoading ? "Processing..." : "Send Internal Transfer"}
                </Button>
                <Button variant="ghost" onClick={retryLast}>Retry Last</Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <div className="text-sm font-semibold mb-2">Response</div>
              <pre className="text-xs bg-gray-100 border border-gray-200 rounded p-2 min-h-[80px]">
{inRes ? pretty(inRes) : "—"}
              </pre>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Error</div>
              <pre className="text-xs bg-gray-100 border border-gray-200 rounded p-2 min-h-[80px]">
{inErr ? pretty(inErr) : "—"}
              </pre>
            </div>
          </div>
        </Card>

        {/* External payment */}
        <Card title="External Payment (UPI ID)">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="extUpi">Payee UPI ID</Label>
                <Input id="extUpi" value={extUpi} onChange={setExtUpi} placeholder="name@bank" />
              </div>
              <div>
                <Label htmlFor="amountExt">Amount (₹)</Label>
                <Input id="amountExt" type="number" value={extAmount} onChange={setExtAmount} placeholder="250.00" />
                <p className="text-xs text-gray-600 mt-1">Paise: {rupeesToPaise(extAmount)}</p>
              </div>
              <div>
                <Label htmlFor="noteExt">Note (optional)</Label>
                <Input id="noteExt" value={extNote} onChange={setExtNote} placeholder="Subscription" />
              </div>
              <div className="flex gap-2">
                <Button onClick={submitExternal} disabled={extLoading}>
                  {extLoading ? "Processing..." : "Pay via UPI (external)"}
                </Button>
                <Button variant="ghost" onClick={retryLast}>Retry Last</Button>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <div className="text-sm font-semibold mb-2">Response</div>
                <pre className="text-xs bg-gray-100 border border-gray-200 rounded p-2 min-h-[80px]">
{extRes ? pretty(extRes) : "—"}
                </pre>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Error</div>
                <pre className="text-xs bg-gray-100 border border-gray-200 rounded p-2 min-h-[80px]">
{extErr ? pretty(extErr) : "—"}
                </pre>
              </div>
            </div>
          </div>
        </Card>

        <footer className="text-xs text-gray-600">
          Note: Update <code>SEARCH_URL</code> to your actual user-search endpoint that supports <code>?q=</code> (by first name / upiId / phone).
        </footer>
      </div>
    </div>
  );
}
