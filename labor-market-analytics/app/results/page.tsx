import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { ResultsAnalytics } from "@/components/results/results-analytics"

export default function ResultsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <ResultsAnalytics />
        </main>
      </div>
    </div>
  )
}
