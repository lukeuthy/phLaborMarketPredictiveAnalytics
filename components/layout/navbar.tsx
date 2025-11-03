"use client"

import { Bell, Settings, User } from "lucide-react"

export function Navbar() {
  return (
    <nav className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-accent">Labor Analytics</h1>
        <span className="text-text-muted text-sm">Philippine Market Dynamics</span>
      </div>

      <div className="flex items-center gap-6">
        <button className="p-2 hover:bg-surface-light rounded-lg transition-colors">
          <Bell size={20} className="text-text-muted" />
        </button>
        <button className="p-2 hover:bg-surface-light rounded-lg transition-colors">
          <Settings size={20} className="text-text-muted" />
        </button>
        <button className="p-2 hover:bg-surface-light rounded-lg transition-colors">
          <User size={20} className="text-text-muted" />
        </button>
      </div>
    </nav>
  )
}
