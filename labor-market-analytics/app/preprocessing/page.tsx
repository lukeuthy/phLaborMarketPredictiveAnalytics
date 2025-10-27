import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { PreprocessingPipeline } from "@/components/preprocessing/preprocessing-pipeline"

export default function PreprocessingPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <PreprocessingPipeline />
        </main>
      </div>
    </div>
  )
}
