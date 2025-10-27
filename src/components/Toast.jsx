export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;
  const base = "fixed right-4 top-20 z-50 px-6 py-4 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-right-2";
  const styles = type === "error"
    ? "bg-red-500 text-white border-red-400 shadow-red-200"
    : "bg-emerald-500 text-white border-emerald-400 shadow-emerald-200";
  const icon = type === "error" ? "⚠️" : "✅";
  return (
    <div className={`${base} ${styles}`} role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span>{message}</span>
        <button 
          onClick={onClose} 
          className="ml-2 text-white/80 hover:text-white text-lg leading-none transition-colors"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
