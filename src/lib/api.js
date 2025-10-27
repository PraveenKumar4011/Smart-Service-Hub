const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function getTickets({ category, priority, q } = {}) {
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);
  if (priority && priority !== "All") params.set("priority", priority);
  if (q) params.set("q", q);
  const res = await fetch(`${BASE_URL}/api/tickets?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch tickets: ${res.status}`);
  return res.json();
}

export async function createTicket(payload) {
  const res = await fetch(`${BASE_URL}/api/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    try {
      const errorData = await res.json();
      if (errorData.details && Array.isArray(errorData.details)) {
        const messages = errorData.details.map(d => d.message).join(', ');
        throw new Error(`Validation errors: ${messages}`);
      }
      throw new Error(errorData.error || `Failed to create ticket: ${res.status}`);
    } catch (parseError) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || `Failed to create ticket: ${res.status}`);
    }
  }
  return res.json();
}
