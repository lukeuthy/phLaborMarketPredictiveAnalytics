import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Settings } from "@/components/settings/settings"

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <Settings />
        </main>
      </div>
    </div>
  )
}
