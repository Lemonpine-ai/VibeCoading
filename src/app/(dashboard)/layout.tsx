export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <nav className="w-64 border-r p-6">
        <p className="text-lg font-semibold">CATvisor</p>
        <ul className="mt-6 space-y-2">
          <li>
            <a href="/feeding" className="block rounded px-3 py-2 hover:bg-gray-100">
              Feeding
            </a>
          </li>
          <li>
            <a href="/logs" className="block rounded px-3 py-2 hover:bg-gray-100">
              Care Logs
            </a>
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
