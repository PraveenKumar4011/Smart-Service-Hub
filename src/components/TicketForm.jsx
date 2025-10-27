import { useState } from "react";
import { createTicket } from "../lib/api";

const categories = ["Network", "Security", "Cloud", "General"];

export default function TicketForm({ onCreated, showToast }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    requestType: "Network",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!emailRegex.test(form.email)) e.email = "Valid email is required";
    if (!form.requestType) e.requestType = "Category is required";
    if (!form.description || form.description.trim().length < 20)
      e.description = "Description must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        requestType: form.requestType,
        description: form.description.trim(),
      };
      const response = await createTicket(payload);
      showToast("Ticket submitted successfully! AI has analyzed and prioritized your request.", "success");
      onCreated?.(response?.data);
      setForm({ name: "", email: "", requestType: "Network", description: "" });
    } catch (err) {
      showToast(err.message || "Failed to submit ticket", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="submit" className="max-w-4xl mx-auto px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-slate-200/50">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Submit a Service Ticket</h2>
          <p className="text-slate-600">Tell us about your issue and we'll get right on it</p>
        </div>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              className="mt-1 w-full rounded-lg border-slate-300 px-4 py-3 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border-slate-300 px-4 py-3 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jane@example.com"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <select
              className="mt-1 w-full rounded-lg border-slate-300 px-4 py-3 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white"
              value={form.requestType}
              onChange={(e) => setForm({ ...form, requestType: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.requestType && <p className="text-sm text-red-600 mt-1">{errors.requestType}</p>}
          </div>

          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">🤖 AI Enhancement:</span> Priority will be automatically determined based on your description
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="mt-1 w-full rounded-lg border-slate-300 px-4 py-3 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the issue in detail (at least 20 characters)"
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? "✨ Submitting..." : "🚀 Submit Ticket"}
            </button>
            <button
              type="button"
              disabled
              className="inline-flex items-center rounded-lg border border-slate-300 text-slate-500 px-4 py-3 cursor-not-allowed bg-slate-50"
              title="Voice input coming soon"
            >
              🎤 Record Audio (coming soon)
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
