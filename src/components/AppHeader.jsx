export default function AppHeader() {
  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl md:text-3xl font-bold text-white drop-shadow-sm">🎫 Smart Service Hub</h1>
        <nav className="text-sm text-blue-100 hidden md:flex gap-6">
          <a className="hover:text-white transition-colors duration-200 px-3 py-2 rounded-md hover:bg-blue-500/20" href="#submit">Submit Ticket</a>
          <a className="hover:text-white transition-colors duration-200 px-3 py-2 rounded-md hover:bg-blue-500/20" href="#dashboard">Dashboard</a>
        </nav>
      </div>
    </header>
  );
}
