"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Database, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"

export function Dashboard() {
  const stats = [
    {
      title: "Data Files",
      value: "0",
      icon: Database,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Preprocessing Tasks",
      value: "0",
      icon: Zap,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Models Trained",
      value: "0",
      icon: BarChart3,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Insights Generated",
      value: "0",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-text-muted">Welcome to Philippine Labor Market Analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-text-muted text-sm mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Start</h2>
          <p className="text-text-muted mb-6">
            Begin your analysis by uploading labor market data from the Philippine Statistics Authority.
          </p>
          <Link href="/upload">
            <Button className="btn-primary">Upload Data</Button>
          </Link>
        </Card>

        <Card className="card-hover">
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <p className="text-text-muted text-sm">No recent activities yet</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
