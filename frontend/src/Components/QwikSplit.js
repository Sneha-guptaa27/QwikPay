import React, { useMemo, useState, useEffect, useMemo as useMemo2 } from "react";
import { Users, CalendarDays, IndianRupee, Plus, Minus, Sparkles, Split, Percent, Trophy, Loader2, CheckCircle2, AlertTriangle, Wallet, Link2, ShieldCheck } from "lucide-react";

/*
  QwikSplit — Polished UI
  -----------------------
  - Pure React + Tailwind (no external UI kit required)
  - Subtle glass / neon accents to match a modern fintech vibe
  - Three-step flow (Details → Participants → Review)
  - Real-time validation & computed previews
  - Sticky summary column on desktop
  - Non-intrusive toast notifications

  Drop-in: replace your existing component with this file.
  Notes:
    • Keeps your original fetch endpoints & payload structure.
    • Uses the same business logic for share calculations.
*/

function cn(...cls) { return cls.filter(Boolean).join(" "); }

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-white/10 border border-white/15">
        <Icon className="w-5 h-5 opacity-90" />
      </div>
      <div>
        <h3 className="text-base font-semibold leading-tight">{title}</h3>
        {subtitle && <p className="text-xs opacity-70 leading-tight">{subtitle}</p>}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
      <div className="text-[11px] uppercase tracking-wide opacity-60">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs opacity-70 mt-1">{hint}</div>}
    </div>
  );
}

function Badge({ children, color = "emerald" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border",
      color === "emerald" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
      color === "sky" && "bg-sky-500/10 border-sky-500/30 text-sky-200",
      color === "amber" && "bg-amber-500/10 border-amber-500/30 text-amber-200",
      color === "rose" && "bg-rose-500/10 border-rose-500/30 text-rose-200"
    )}>{children}</span>
  );
}

function Toast({ kind = "success", text, onClose }) {
  const icon = kind === "error" ? <AlertTriangle className="w-4 h-4"/> : <CheckCircle2 className="w-4 h-4"/>;
  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 min-w-[260px] max-w-[94vw]",
      "bg-white/10 border border-white/20 backdrop-blur rounded-xl px-3 py-2",
      kind === "error" ? "text-rose-100 border-rose-300/30" : "text-emerald-100 border-emerald-300/30"
    )}>
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-sm">{text}</div>
        <button onClick={onClose} className="ml-auto text-xs opacity-70 hover:opacity-100">Dismiss</button>
      </div>
    </div>
  );
}

export default function QwikSplit({ baseUrl = "/api/v1/split", tokenGetter = () => localStorage.getItem("token") }) {
  const [yourId, setYourId] = useState("");
  const [title, setTitle] = useState("");
  const [totalRs, setTotalRs] = useState("");
  const [splitType, setSplitType] = useState("equal"); // equal | exact | percentage
  const [dueDate, setDueDate] = useState("");
  const [participants, setParticipants] = useState([]); // { userId, share }
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null); // { split, dues }
  const [error, setError] = useState("");
  const [paying, setPaying] = useState({});
  const [step, setStep] = useState(1); // 1 Details, 2 Participants, 3 Review
  const [toast, setToast] = useState(null);

  const headers = useMemo(() => {
    const token = tokenGetter?.();
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  }, [tokenGetter]);

  // --- helpers ---
  const rsToPaise = (x) => {
    const n = Number(x);
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  };
  const paise = (x) => Math.max(0, Math.floor(Number(x) || 0));

  function addRow() {
    setParticipants((rows) => [...rows, { userId: "", share: "" }]);
  }
  function removeRow(i) {
    setParticipants((rows) => rows.filter((_, idx) => idx !== i));
  }
  function updateRow(i, key, val) {
    setParticipants((rows) => rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  }

  // Build payload participants with shareAmountPaise
  function buildPayloadParticipants() {
    const totalPaise = rsToPaise(totalRs);
    const all = participants.map((p) => ({ userId: (p.userId || "").trim(), share: Number(p.share || 0) }));

    // Basic validation
    const ids = all.map((p) => p.userId).filter(Boolean);
    if (ids.length !== all.length) throw new Error("Fill all participant user IDs");
    if (!all.length) throw new Error("Add at least one participant");

    if (splitType === "equal") {
      const each = Math.floor(totalPaise / all.length);
      let remaining = totalPaise - each * all.length; // distribute remainder
      return all.map((p) => ({ userId: p.userId, shareAmountPaise: each + (remaining-- > 0 ? 1 : 0) }));
    }

    if (splitType === "exact") {
      const sharesPaise = all.map((p) => paise(rsToPaise(p.share)));
      const sum = sharesPaise.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - totalPaise) > 1) throw new Error("Exact shares (₹) must sum to total");
      return all.map((p, idx) => ({ userId: p.userId, shareAmountPaise: sharesPaise[idx] }));
    }

    // percentage
    const sumPct = all.reduce((a, b) => a + (Number(b.share) || 0), 0);
    if (Math.abs(sumPct - 100) > 0.01) throw new Error("Percentages must sum to 100");
    const raw = all.map((p) => Math.floor((totalPaise * Number(p.share)) / 100));
    let assigned = raw.reduce((a, b) => a + b, 0);
    let rem = totalPaise - assigned;
    return all.map((p, idx) => ({ userId: p.userId, shareAmountPaise: raw[idx] + (rem-- > 0 ? 1 : 0) }));
  }

  async function createSplit() {
    try {
      setError("");
      setCreating(true);

      const payload = {
        title: title.trim(),
        totalAmountPaise: rsToPaise(totalRs),
        splitType,
        participants: buildPayloadParticipants(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      if (!payload.title) throw new Error("Give a title");
      if (!payload.totalAmountPaise) throw new Error("Enter total amount in ₹");

      const res = await fetch(`${baseUrl}/createSplit`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCreated(data);
      setStep(3);
      setToast({ kind: "success", text: "Split created successfully." });
    } catch (e) {
      setCreated(null);
      setError(String(e.message || e));
      setToast({ kind: "error", text: String(e.message || e) });
    } finally {
      setCreating(false);
    }
  }

  async function payDue(dueId) {
    try {
      setPaying((m) => ({ ...m, [dueId]: true }));
      setError("");

      let res = await fetch(`${baseUrl}/payDUe/${dueId}`, { method: "POST", headers });
      if (!res.ok) {
        try { res = await fetch(`${baseUrl}/payDUe`, { method: "POST", headers, body: JSON.stringify({ dueId }) }); } catch (_) {}
      }
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setCreated((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, dues: prev.dues?.map((d) => (d._id === dueId ? { ...d, status: "settled" } : d)) };
        return updated;
      });
      setToast({ kind: "success", text: "Payment successful." });
      return data;
    } catch (e) {
      setError(String(e.message || e));
      setToast({ kind: "error", text: String(e.message || e) });
    } finally {
      setPaying((m) => ({ ...m, [dueId]: false }));
    }
  }

  const youCanPay = (d) => yourId && d.debtorId === yourId && d.status !== "settled";

  // Derived values for preview panel
  const totalPaise = rsToPaise(totalRs);
  const pCount = participants.length || 0;
  const eachEqualPaise = splitType === "equal" && pCount > 0 ? Math.floor(totalPaise / pCount) : 0;
  const equalRemainder = splitType === "equal" && pCount > 0 ? totalPaise - eachEqualPaise * pCount : 0;

  const splitTypeLabel = splitType === "equal" ? "Equal" : splitType === "exact" ? "Exact" : "Percentage";

  return (
    <div className="qwikpay w-full min-h-[100vh] bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/10 border border-white/15">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">QwikSplit</h1>
              <p className="text-sm opacity-70">Create a split, share a link, and settle dues instantly.</p>
            </div>
          </div>
          <Badge color="amber"><ShieldCheck className="w-3 h-3"/> Auth protected</Badge>
        </div>

        {/* Stepper */}
        <div className="mt-6 mb-4 grid grid-cols-3 gap-2">
          {[1,2,3].map((i) => (
            <div key={i} className={cn(
              "relative h-2 rounded-full overflow-hidden",
              "bg-white/10 border border-white/10",
              step >= i && "ring-1 ring-emerald-400/30"
            )}>
              <div className={cn(
                "absolute inset-y-0 left-0",
                step >= i ? "w-full bg-emerald-500" : step + 1 === i ? "w-1/5 bg-white/20" : "w-0"
              )}/>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mt-4">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Step 1: Details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <SectionHeader icon={Sparkles} title="1 · Split details" subtitle="Give your split a title, total and due date" />
              <div className="grid md:grid-cols-3 gap-3 mt-4">
                <label className="md:col-span-2">
                  <div className="text-xs mb-1 opacity-70">Title</div>
                  <input className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 outline-none focus:ring-2 focus:ring-emerald-400/40" placeholder="Goa Trip Dinner" value={title} onChange={(e) => setTitle(e.target.value)} />
                </label>
                <label>
                  <div className="text-xs mb-1 opacity-70">Total (₹)</div>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3 top-2.5 opacity-70"/>
                    <input className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/15 outline-none focus:ring-2 focus:ring-emerald-400/40" type="number" step="0.01" placeholder="1200" value={totalRs} onChange={(e) => setTotalRs(e.target.value)} />
                  </div>
                </label>
              </div>

              <div className="grid md:grid-cols-3 gap-3 mt-3 items-end">
                <div className="md:col-span-2">
                  <div className="text-xs mb-1 opacity-70">Split type</div>
                  <div className="flex gap-2 text-sm">
                    {[{t:"equal",icon:Users},{t:"exact",icon:IndianRupee},{t:"percentage",icon:Percent}].map(({t,icon:Icon}) => (
                      <button key={t} type="button" onClick={() => setSplitType(t)} className={cn(
                        "px-3 py-1.5 rounded-xl border transition",
                        splitType === t ? "bg-white/20 border-white/30 shadow-inner" : "bg-white/10 border-white/15 hover:bg-white/15"
                      )}>
                        <div className="flex items-center gap-2"><Icon className="w-4 h-4"/>{t}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <label>
                  <div className="text-xs mb-1 opacity-70">Due date</div>
                  <div className="relative">
                    <CalendarDays className="w-4 h-4 absolute left-3 top-2.5 opacity-70"/>
                    <input className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/15 outline-none focus:ring-2 focus:ring-emerald-400/40" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </label>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button onClick={() => setStep(2)} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60" disabled={!title || !Number(totalRs)}>
                  Next: Participants
                </button>
                {error && <div className="text-sm text-rose-300 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> {error}</div>}
              </div>
            </div>

            {/* Step 2: Participants */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <SectionHeader icon={Users} title="2 · Participants" subtitle="Add users and their shares" />

              {/* Table header */}
              <div className="grid grid-cols-12 bg-white/5 px-3 py-2 text-sm font-medium rounded-xl mt-4 border border-white/10">
                <div className="col-span-6">User ID</div>
                <div className="col-span-5 text-right">{splitType === "percentage" ? "% Share" : splitType === "exact" ? "Share (₹)" : "Share (auto)"}</div>
                <div className="col-span-1 text-right"> </div>
              </div>
              <div className="divide-y divide-white/10 rounded-xl border border-white/10 mt-2 overflow-hidden">
                {participants.length === 0 && (
                  <div className="px-3 py-6 text-sm text-center opacity-70">No participants yet. Add at least one.</div>
                )}
                {participants.map((p, idx) => (
                  <div className="grid grid-cols-12 px-3 py-2 items-center bg-white/[0.02] hover:bg-white/[0.05] transition" key={idx}>
                    <input className="col-span-6 px-2 py-1 rounded-lg bg-white/10 border border-white/15 outline-none focus:ring-2 focus:ring-sky-400/40" placeholder="user_123" value={p.userId} onChange={(e) => updateRow(idx, "userId", e.target.value)} />
                    {splitType === "equal" ? (
                      <div className="col-span-5 text-right text-sm opacity-80 select-none">auto</div>
                    ) : (
                      <input className="col-span-5 px-2 py-1 rounded-lg bg-white/10 border border-white/15 text-right outline-none focus:ring-2 focus:ring-sky-400/40" type="number" step="0.01" placeholder={splitType === "percentage" ? "e.g., 25" : "e.g., 350"} value={p.share} onChange={(e) => updateRow(idx, "share", e.target.value)} />
                    )}
                    <div className="col-span-1 text-right">
                      <button type="button" className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20" onClick={() => removeRow(idx)} aria-label="Remove row"><Minus className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <button type="button" className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-2" onClick={addRow}><Plus className="w-4 h-4"/> Add participant</button>
                <button type="button" className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700" onClick={() => setStep(3)} disabled={participants.length === 0}>Review & Create</button>
                <button type="button" className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20" onClick={() => setStep(1)}>Back</button>
              </div>
            </div>

            {/* Step 3: Review & Create */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <SectionHeader icon={Trophy} title="3 · Review & Create" subtitle="Double-check everything before creating the split" />

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="text-sm bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                  <div><span className="opacity-70">Title:</span> {title || <em className="opacity-60">(none)</em>}</div>
                  <div><span className="opacity-70">Total:</span> ₹{Number(totalRs || 0).toLocaleString()}</div>
                  <div><span className="opacity-70">Type:</span> {splitTypeLabel}</div>
                  {dueDate && <div><span className="opacity-70">Due:</span> {new Date(dueDate).toLocaleDateString()}</div>}
                </div>
                <div className="text-sm bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="opacity-70 mb-1">Preview</div>
                  {splitType === "equal" && (
                    <div>
                      <div>Each pays: <span className="font-semibold">₹{(eachEqualPaise/100).toFixed(2)}</span></div>
                      {!!equalRemainder && <div className="text-xs opacity-70">Note: {equalRemainder} paise distributed to first {equalRemainder} participant(s).</div>}
                    </div>
                  )}
                  {splitType !== "equal" && (
                    <div className="text-xs opacity-70">Exact/Percentage amounts computed on submit.</div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button type="button" className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-60" onClick={createSplit} disabled={creating || !title || !Number(totalRs) || participants.length === 0}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                  {creating ? "Creating…" : "Create split"}
                </button>
                <button type="button" className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20" onClick={() => setStep(2)}>Back</button>
                {error && <div className="text-sm text-rose-300 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> {error}</div>}
              </div>
            </div>

            {/* Result panel */}
            {created && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Created split</h3>
                  <div className="text-sm opacity-80 flex items-center gap-2">
                    <Link2 className="w-4 h-4"/>
                    <span>Code:</span>
                    <span className="font-mono">{created?.split?.linkCode}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Split details</h4>
                    <div className="text-sm bg-white/5 border border-white/10 rounded-xl p-3">
                      <div><span className="opacity-70">Title:</span> {created.split?.title}</div>
                      <div><span className="opacity-70">Total:</span> ₹{(created.split?.totalAmount ?? 0 / 100).toLocaleString()}</div>
                      <div><span className="opacity-70">Type:</span> {created.split?.splitType}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Dues</h4>
                    {!created.dues?.length && <div className="text-sm opacity-70">No dues (everyone is creator?)</div>}
                    <ul className="space-y-2 max-h-[260px] overflow-auto pr-1">
                      {created.dues?.map((d) => (
                        <li key={d._id} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div><span className="opacity-70">Debtor:</span> {d.debtorId}</div>
                              <div><span className="opacity-70">Creditor:</span> {d.creditorId}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">₹{((d.amount || 0) / 100).toLocaleString()}</div>
                              <div className={cn("text-xs", d.status === "settled" ? "text-emerald-400" : "opacity-70")}>{d.status || "due"}</div>
                            </div>
                          </div>
                          {youCanPay(d) && d.status !== "settled" && (
                            <div className="mt-2 text-right">
                              <button className="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-sm inline-flex items-center gap-2" onClick={() => payDue(d._id)} disabled={!!paying[d._id]}>
                                {paying[d._id] ? (<><Loader2 className="w-4 h-4 animate-spin"/> Paying…</>) : (<><Wallet className="w-4 h-4"/> Pay due</>)}
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column: Sticky summary & yourId */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 h-fit space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <SectionHeader icon={IndianRupee} title="Summary" />
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Stat label="Total" value={`₹${Number(totalRs || 0).toLocaleString()}`} />
                <Stat label="Participants" value={participants.length} />
                <Stat label="Type" value={splitTypeLabel} />
                <Stat label="Status" value={created ? "Created" : "Draft"} />
              </div>
              {splitType === "equal" && participants.length > 0 && (
                <div className="mt-3 text-xs opacity-80">
                  ≈ Each pays <span className="font-semibold">₹{(eachEqualPaise/100).toFixed(2)}</span>
                  {equalRemainder ? ` • ${equalRemainder} paise remainder auto-adjusted` : ""}
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-sm font-medium mb-1">Your User ID</div>
              <input className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 outline-none focus:ring-2 focus:ring-sky-400/40" placeholder="(must match backend req.user._id)" value={yourId} onChange={(e) => setYourId(e.target.value)} />
              <p className="text-xs opacity-70 mt-2">Used only by the UI to decide which dues you can pay. Server still checks auth.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-sm font-medium mb-2">Tips</div>
              <ul className="text-xs space-y-2 opacity-80">
                <li>• Add yourself <em>only</em> if you also owe money. Creator’s dues are auto-excluded.</li>
                <li>• Exact & % shares are validated to sum up correctly.</li>
                <li>• Keep IDs consistent with your backend <code className="px-1 bg-white/10 rounded">req.user._id</code>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast kind={toast.kind} text={toast.text} onClose={() => setToast(null)} />}
    </div>
  );
}


export { QwikSplit};
