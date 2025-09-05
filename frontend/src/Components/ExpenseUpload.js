import React, { useState } from "react";
import api from "../API/api";

const ExpenseUpload = ({ mode = "both" }) => {
  const [file, setFile] = useState(null);   // OCR bill
  const [xls, setXls] = useState(null);     // Bank statement
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("");

  // ===== COLORS =====
  const primary = "#F9F3EF";
  const secondary = "#456882";
  const third = "#1B3C53";

  // ===== OCR upload =====
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("Uploading…");
      const res = await api.post("/expense/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setJobId(res.data.jobId);
      setStatus("Uploaded! Processing OCR…");
      pollJob(res.data.jobId);
    } catch (err) {
      setStatus("❌ Upload error: " + (err.response?.data?.error || err.message));
    }
  };

  const pollJob = (id) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/expense/upload/${id}`);
        const job = res.data;
        if (job.status === "done") {
          clearInterval(interval);
          setStatus("✅ OCR Completed. Expense created: " + job.result.expenseId);
          window.dispatchEvent(new Event("expenses:changed")); // refresh list
          // Optional: fetch plain text for debugging
          // await fetchText(job.attachmentId);
        } else if (job.status === "failed") {
          clearInterval(interval);
          setStatus("❌ OCR Failed: " + job.error);
        }
      } catch (err) {
        clearInterval(interval);
        setStatus("❌ Poll error: " + err.message);
      }
    }, 3000);
  };

  // const fetchText = async (attachmentId) => {
  //   try {
  //     const text = await api.get(`/expense/attachment/text/${attachmentId}`, {
  //       headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  //       responseType: "text",
  //       transformResponse: [(d) => d],
  //     });
  //     console.log(text);
  //   } catch (err) {
  //     console.error("Error fetching attachment text:", err);
  //   }
  // };

  // ===== Bank import =====
  const handleXlsImport = async (e) => {
    e.preventDefault();
    if (!xls) return;

    try {
      setStatus("Uploading statement…");
      const fd = new FormData();
      fd.append("file", xls);

      const up = await api.post("/expense/attachment/xls", fd, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });

      const { attachmentId, rowsCount } = up.data;
      setStatus(`Imported ${rowsCount} rows. Creating expenses…`);

      await api.post(`/expense/attachment/${attachmentId}/commit`);
      setStatus(`✅ Import complete (${rowsCount} rows).`);
      window.dispatchEvent(new Event("expenses:changed")); // refresh list
    } catch (err) {
      setStatus("✗ Import failed: " + (err.response?.data?.error || err.message));
    }
  };

  // ===== UI =====
  return (
    <div
      className="rounded-xl p-6 space-y-6"
      style={{ background: primary, border: `1px solid ${secondary}` }}
    >
      {/* OCR Section */}
      {mode !== "bank" && (
        <div
          className="rounded-lg p-4"
          style={{ background: "#fff", border: `1px solid ${secondary}` }}
        >
          <h3 className="text-base font-semibold mb-3" style={{ color: third }}>
            Upload Bill (OCR)
          </h3>
          <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-3">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="px-3 py-2 rounded-lg"
              style={{ border: `1px solid ${secondary}` }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ background: third, color: "#fff" }}
            >
              Upload & Process
            </button>
          </form>
        </div>
      )}

      {/* Bank Statement Section */}
      {mode !== "ocr" && (
        <div
          className="rounded-lg p-4"
          style={{ background: "#fff", border: `1px solid ${secondary}` }}
        >
          <h3 className="text-base font-semibold mb-3" style={{ color: third }}>
            Import Bank Statement (.xls / .xlsx / .csv)
          </h3>
          <form onSubmit={handleXlsImport} className="flex flex-col md:flex-row gap-3">
            <input
              accept=".xls,.xlsx,.csv"
              type="file"
              onChange={(e) => setXls(e.target.files[0])}
              required
              className="px-3 py-2 rounded-lg"
              style={{ border: `1px solid ${secondary}` }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ background: third, color: "#fff" }}
            >
              Import Statement
            </button>
          </form>
        </div>
      )}

      {status && (
        <p className="text-sm" style={{ color: secondary }}>
          {status}
        </p>
      )}
    </div>
  );
};

export default ExpenseUpload;
