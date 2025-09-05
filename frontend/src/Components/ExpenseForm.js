import { useState } from "react";
import api from "../API/api";

const ExpenseForm = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    payee: "",
    amount: "",
    date: "",
    tags: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        "/expense/create",
        {
          ...form,
          amountPaise: parseFloat(form.amount),
        },
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
      );
      setMessage("✅ Expense added: " + res.data.title);
      window.dispatchEvent(new Event("expenses:changed")); // auto-refresh
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: "#F9F3EF", border: "1px solid #456882" }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: "#1B3C53" }}>
        Add Expense
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          className="px-3 py-2 rounded-lg"
          style={{ border: "1px solid #456882" }}
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="px-3 py-2 rounded-lg"
          style={{ border: "1px solid #456882" }}
        />

        <input
          name="category"
          placeholder="Category (e.g. Food, Travel)"
          value={form.category}
          onChange={handleChange}
          className="px-3 py-2 rounded-lg"
          style={{ border: "1px solid #456882" }}
        />

        <input
          name="payee"
          placeholder="Payee"
          value={form.payee}
          onChange={handleChange}
          className="px-3 py-2 rounded-lg"
          style={{ border: "1px solid #456882" }}
        />

        <input
          name="amount"
          type="number"
          placeholder="Amount (₹)"
          value={form.amount}
          onChange={handleChange}
          required
          className="px-3 py-2 rounded-lg"
          style={{ border: "1px solid #456882" }}
        />

        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="px-3 py-2 rounded-lg"
          style={{ border: "1px solid #456882" }}
        />

        <input
          name="tags"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={handleChange}
          className="px-3 py-2 rounded-lg md:col-span-2"
          style={{ border: "1px solid #456882" }}
        />

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg font-semibold"
            style={{ background: "#1B3C53", color: "#fff" }}
          >
            Save
          </button>
        </div>
      </form>

      {message && (
        <p className="mt-3 text-sm" style={{ color: "#456882" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ExpenseForm;
