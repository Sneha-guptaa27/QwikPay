import { useState, useCallback } from "react";
import api from "../API/api";
import { Heading } from "./Heading";
import { Input } from "./Input";
import { Button } from "./Button";
import ReactToastContainer from "./toast";
import Dropdown from "./Dropdown";
import { useNavigate } from "react-router-dom";

/** Load Razorpay script if not already present */
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.body.appendChild(script);
  });
}

export function ExternalPayment() {
  const [method, setMethod] = useState("upi"); // default lowercase to match options
  const [payee, setPayee] = useState("");
  const [amountInput, setAmountInput] = useState(""); // rupees typed by user
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  const navigate = useNavigate();

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const getFromAccountId = useCallback(async () => {
    // Assumes your api instance attaches token automatically (interceptor).
    // If not, pass headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    const res = await api.get("/account/getaccount");
    // Adjust indexing/shape if your API differs
    const acct = Array.isArray(res.data) ? res.data[0] : res.data?.account || res.data?.[0];
    if (!acct?._id) throw new Error("from_account_not_found");
    return acct._id;
  }, []);

  const parsePaise = (rupeesStr) => {
    const val = String(rupeesStr).trim();
    if (!val) return 0;
    const n = Number(val);
    if (!Number.isFinite(n) || n <= 0) return 0;
    // Support decimals (e.g., 123.45 -> 12345 paise)
    return Math.round(n * 100);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (busy) return;

    try {
      setBusy(true);

      const amountPaise = parsePaise(amountInput);
      if (!amountPaise) {
        showToast("error", "Enter a valid amount (e.g., 199.50)");
        setBusy(false);
        return;
      }
      if (!payee?.trim()) {
        showToast("error", "Please enter the receiver's name");
        setBusy(false);
        return;
      }

      const fromAccountId = await getFromAccountId();

      // ---- Fallback to your old MOCK flow if user selects "mock" ----
      if (method === "mock") {
        const idk = Date.now().toString();
        const response = await api.post(
          "/payment/externalPayment",
          { amountPaise, note, fromAccountId, payee, method: "mock" },
          { headers: { "idempotency-key": idk } }
        );

        if (response.data?.duplicate) {
          showToast("error", `Duplicate Request. Transaction Id: ${response.data.txId}`);
        } else {
          showToast(
            "success",
            `Transaction Successful. Txn: ${response.data.txId} Ref: ${response.data.providerRef}`
          );
          setTimeout(() => navigate("/HomePage"), 1500);
        }
        setBusy(false);
        return;
      }

      // ---- Razorpay flow ----
      await loadRazorpay();

      // 1) Ask server to create an order
      const orderResp = await api.post("/payment/createExternalOrder", {
        fromAccountId,
        amountPaise, // paise
        note,
        payee,
      });

      if (!orderResp.data?.ok || !orderResp.data?.order?.id || !orderResp.data?.keyId) {
        throw new Error("Failed to create order");
      }

      const { keyId, order } = orderResp.data;

      // 2) Open Razorpay Checkout
      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount, // in paise
        currency: order.currency || "INR",
        name: "QwikPay",
        description: note || "External Payment",
        order_id: order.id,
        prefill: {
          name: payee,
          // add email/contact if you have
        },
        notes: {
          payee,
        },
        // Optional: open specific method tab first
        // config: { display: { blocks: { /* advanced UI config here */ } } },
        handler: async function (response) {
          try {
            // 3) Verify payment on server; deduct balance & record transaction
            const verify = await api.post("/payment/verifyExternalPayment", {
              fromAccountId,
              payee,
              note,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verify.data?.duplicate) {
              showToast("error", `Duplicate Request. Transaction Id: ${verify.data.txId}`);
            } else if (verify.data?.ok) {
              showToast(
                "success",
                `Payment Successful. Txn: ${verify.data.txId} Ref: ${verify.data.providerRef}`
              );
              setTimeout(() => navigate("/HomePage"), 1500);
            } else {
              showToast("error", "Verification failed");
            }
          } catch (err) {
            console.error(err);
            showToast("error", "Verification failed");
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: function () {
            setBusy(false);
            showToast("error", "Payment cancelled");
          },
        },
        theme: { color: "#0ea5e9" }, // optional UI tint
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      showToast("error", err?.response?.data?.error || err.message || "Transaction Failed");
      setBusy(false);
    }
  };

return (
  <div className="flex justify-center">
    <div className="flex flex-col justify-center mt-10">
      <div className="w-[500px] rounded-lg text-center p-8 bg-white shadow-lg">
        <Heading title={"TRANSFER MONEY EXTERNALLY"} />

        <div className="mt-[20px] space-y-3 text-left">
          <Input
            label={"Receiver's Name"}
            placeholder={"Enter Name Of Receiver"}
            onChange={(e) => setPayee(e.target.value)}
            value={payee}
          />

          <Input
            label={"Amount (₹)"}
            placeholder={"e.g. 199.50"}
            onChange={(e) => setAmountInput(e.target.value)}
            value={amountInput}
          />

          <Input
            label={"Note"}
            placeholder={"Enter message for receiver"}
            onChange={(e) => setNote(e.target.value)}
            value={note}
          />

          <Dropdown
            label={"Payment Method"}
            placeholder={"Select Method"}
            onChange={setMethod}
            value={method}
            options={[
              { label: "UPI (Razorpay)", value: "upi" },
              { label: "Card (Razorpay)", value: "card" },
              { label: "Netbanking (Razorpay)", value: "netbanking" },
              { label: "Wallet (Razorpay)", value: "wallet" },
              { label: "Mock (no Razorpay)", value: "mock" },
            ]}
          />

          <Button
            label={busy ? "Processing..." : "Send Money"}
            onClick={handleTransfer}
            disabled={busy}
          />
        </div>
      </div>

      <ReactToastContainer type={toast.type} message={toast.message} />
    </div>
  </div>
);

}