"use client"

import { BarChart3, Database, Settings, TrendingUp, Upload, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  { icon: BarChart3, label: "Dashboard", href: "/" },
  { icon: Upload, label: "Upload Data", href: "/upload" },
  { icon: Database, label: "Preprocessing", href: "/preprocessing" },
  { icon: Zap, label: "Processing", href: "/processing" },
  { icon: TrendingUp, label: "Results", href: "/results" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-surface border-r border-border p-6 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">PhilLab</h2>
            <p className="text-xs text-text-muted">Analytics Suite</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? "bg-primary text-white" : "text-text-muted hover:bg-surface-light hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="pt-6 border-t border-border">
        <p className="text-xs text-text-muted mb-3">Version 1.0.0</p>
        <p className="text-xs text-text-muted">© 2025 Philippine Labor Analytics</p>
      </div>
    </aside>
  )
}
