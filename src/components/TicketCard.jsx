import { Badge } from "./Badge";

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

export default function TicketCard({ ticket }) {
  return (
    <div className="bg-white rounded shadow p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-slate-800">#{ticket.id}</div>
        <div className="flex gap-2">
          <Badge color={categoryColor(ticket.category)}>{ticket.category}</Badge>
          <Badge color={priorityColor(ticket.priority)}>{ticket.priority}</Badge>
        </div>
      </div>
      <div className="text-sm text-slate-700">
        <div className="font-medium">{ticket.name}</div>
        <div className="text-slate-500">{ticket.email}</div>
      </div>
      <p className="text-sm text-slate-700">
        {ticket.description?.slice(0, 120)}{ticket.description?.length > 120 ? "…" : ""}
      </p>
      <div className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleString()}</div>
    </div>
  );
}
