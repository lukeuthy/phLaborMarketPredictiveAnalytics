import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { DataUpload } from "@/components/upload/data-upload"

export default function UploadPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <DataUpload />
        </main>
      </div>
    </div>
  )
}
