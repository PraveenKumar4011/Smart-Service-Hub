import { useEffect, useMemo, useState } from "react";
import { getTickets } from "../lib/api";
import TicketCard from "./TicketCard";
import { Badge } from "./Badge";

const categories = ["All", "Network", "Security", "Cloud", "General"];
const priorities = ["All", "Low", "Medium", "High", "Urgent"];

function categoryColor(category) {
  switch (category) {
    case "Network":
      return "blue";
    case "Security":
      return "red";
    case "Cloud":
      return "indigo";
    default:
      return "slate";
  }
}

function priorityColor(priority) {
  switch (priority) {
    case "Low":
      return "green";
    case "Medium":
      return "yellow";
    case "High":
      return "red";
    case "Urgent":
      return "purple";
    default:
      return "slate";
  }
}

export default function Dashboard({ refreshKey }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getTickets({ category, priority, q });
        if (!ignore) setTickets(response?.data || []);
      } catch (e) {
        console.error('Failed to load tickets:', e);
        if (!ignore) setError(e.message || "Failed to load tickets");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [category, priority, q, refreshKey]);

  const filtered = useMemo(() => Array.isArray(tickets) ? tickets : [], [tickets]);

  return (
    <section id="dashboard" className="max-w-6xl mx-auto px-4 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">📋 Service Tickets Dashboard</h2>
        <p className="text-slate-600">View and manage all service requests</p>
      </div>
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-slate-200/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            placeholder="🔍 Search by name or description"
            className="rounded-lg border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="rounded-lg border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="rounded-lg border-slate-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <div className="text-sm text-slate-600 flex items-center font-semibold bg-slate-100 px-4 py-3 rounded-lg">
            📊 {filtered.length} ticket(s)
          </div>
        </div>
      </div>

      {loading && <div className="text-slate-600">Loading tickets…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="space-y-4">
          {/* Table for md+ */}
          <div className="hidden md:block bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-200/50">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm font-medium text-indigo-600">#{t.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">{t.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{t.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <Badge color={categoryColor(t.category)}>{t.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <Badge color={priorityColor(t.priority)}>{t.priority}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                      <div className="truncate" title={t.description}>
                        {t.description?.slice(0, 80)}{t.description?.length > 80 ? "…" : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards for small screens */}
          <div className="grid md:hidden grid-cols-1 gap-3">
            {filtered.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
