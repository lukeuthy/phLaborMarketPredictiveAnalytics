import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { AlgorithmComparison } from "@/components/processing/algorithm-comparison"

export default function ProcessingPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <AlgorithmComparison />
        </main>
      </div>
    </div>
  )
}
