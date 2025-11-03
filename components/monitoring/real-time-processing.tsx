"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Play, Pause, Square, AlertCircle, CheckCircle, Clock, Zap } from "lucide-react"

interface ProcessingTask {
  id: string
  name: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  startTime: string
  estimatedTime: string
  logs: string[]
}

interface SystemMetrics {
  timestamp: string
  cpu: number
  memory: number
  diskIO: number
}

const initialTasks: ProcessingTask[] = [
  {
    id: "1",
    name: "Data Validation",
    status: "completed",
    progress: 100,
    startTime: "14:32:00",
    estimatedTime: "2m 15s",
    logs: ["✓ Validation started", "✓ 160 records processed", "✓ Validation completed"],
  },
  {
    id: "2",
    name: "Missing Values Handling",
    status: "running",
    progress: 65,
    startTime: "14:34:15",
    estimatedTime: "1m 30s",
    logs: [
      "✓ Processing started",
      "✓ Detected 12 missing values",
      "→ Applying interpolation method",
      "→ Processing 8 of 12 values",
    ],
  },
  {
    id: "3",
    name: "Outlier Detection",
    status: "pending",
    progress: 0,
    startTime: "-",
    estimatedTime: "1m 45s",
    logs: ["⏳ Waiting to start"],
  },
  {
    id: "4",
    name: "Feature Normalization",
    status: "pending",
    progress: 0,
    startTime: "-",
    estimatedTime: "1m 20s",
    logs: ["⏳ Waiting to start"],
  },
  {
    id: "5",
    name: "Model Training (SARIMA)",
    status: "pending",
    progress: 0,
    startTime: "-",
    estimatedTime: "3m 45s",
    logs: ["⏳ Waiting to start"],
  },
]

const systemMetricsData = [
  { time: "14:30", cpu: 25, memory: 45, diskIO: 12 },
  { time: "14:31", cpu: 32, memory: 48, diskIO: 18 },
  { time: "14:32", cpu: 45, memory: 52, diskIO: 25 },
  { time: "14:33", cpu: 58, memory: 58, diskIO: 35 },
  { time: "14:34", cpu: 72, memory: 65, diskIO: 42 },
  { time: "14:35", cpu: 68, memory: 62, diskIO: 38 },
  { time: "14:36", cpu: 55, memory: 58, diskIO: 28 },
]

export function RealTimeProcessing() {
  const [tasks, setTasks] = useState<ProcessingTask[]>(initialTasks)
  const [isRunning, setIsRunning] = useState(true)
  const [selectedTask, setSelectedTask] = useState<string>("2")
  const [autoScroll, setAutoScroll] = useState(true)

  // Simulate real-time progress updates
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.status === "running" && task.progress < 100) {
            const newProgress = Math.min(task.progress + Math.random() * 15, 100)
            const newLogs = [...task.logs]

            if (newProgress >= 100) {
              newLogs.push("✓ Task completed successfully")
              return {
                ...task,
                progress: 100,
                status: "completed",
                logs: newLogs,
              }
            }

            if (Math.random() > 0.7) {
              newLogs.push(`→ Processing ${Math.floor(newProgress)}% complete`)
            }

            return {
              ...task,
              progress: newProgress,
              logs: newLogs,
            }
          }

          // Start next pending task when current completes
          if (task.status === "completed" && task.progress === 100) {
            const nextPendingIndex = prevTasks.findIndex((t) => t.status === "pending")
            if (nextPendingIndex !== -1 && prevTasks[nextPendingIndex].id === task.id) {
              return {
                ...prevTasks[nextPendingIndex],
                status: "running",
                logs: ["✓ Task started", "→ Processing..."],
              }
            }
          }

          return task
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} className="text-success" />
      case "running":
        return <Zap size={20} className="text-warning animate-pulse" />
      case "failed":
        return <AlertCircle size={20} className="text-error" />
      default:
        return <Clock size={20} className="text-text-muted" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/20 text-success">Completed</Badge>
      case "running":
        return <Badge className="bg-warning/20 text-warning">Running</Badge>
      case "failed":
        return <Badge className="bg-error/20 text-error">Failed</Badge>
      default:
        return <Badge className="bg-info/20 text-info">Pending</Badge>
    }
  }

  const selectedTaskData = tasks.find((t) => t.id === selectedTask)
  const completedCount = tasks.filter((t) => t.status === "completed").length
  const totalTime = tasks.reduce((acc, t) => {
    const match = t.estimatedTime.match(/(\d+)m\s*(\d+)s/)
    if (match) {
      return acc + Number.parseInt(match[1]) * 60 + Number.parseInt(match[2])
    }
    return acc
  }, 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Real-time Processing</h1>
        <p className="text-text-muted">Monitor and control data processing pipeline</p>
      </div>

      {/* Control Panel */}
      <div className="mb-8">
        <Card className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">Pipeline Control</h2>
              <p className="text-sm text-text-muted">
                {completedCount} of {tasks.length} tasks completed
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsRunning(!isRunning)} className={isRunning ? "btn-secondary" : "btn-primary"}>
                {isRunning ? (
                  <>
                    <Pause size={16} className="mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    Resume
                  </>
                )}
              </Button>
              <Button className="btn-secondary">
                <Square size={16} className="mr-2" />
                Stop
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Completed</p>
          <p className="text-3xl font-bold text-success">{completedCount}</p>
          <p className="text-xs text-text-muted mt-2">of {tasks.length} tasks</p>
        </Card>
        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Running</p>
          <p className="text-3xl font-bold text-warning">{tasks.filter((t) => t.status === "running").length}</p>
          <p className="text-xs text-text-muted mt-2">active tasks</p>
        </Card>
        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Estimated Time</p>
          <p className="text-3xl font-bold text-accent">{Math.ceil(totalTime / 60)}m</p>
          <p className="text-xs text-text-muted mt-2">total remaining</p>
        </Card>
        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Overall Progress</p>
          <p className="text-3xl font-bold text-info">
            {Math.round((tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length / 100) * 100)}%
          </p>
          <p className="text-xs text-text-muted mt-2">pipeline completion</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card">
            <h2 className="text-xl font-bold text-foreground mb-6">Processing Tasks</h2>
            <div className="space-y-4">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTask === task.id ? "border-accent bg-surface-light" : "border-border hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getStatusIcon(task.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-foreground">{task.name}</h3>
                        {getStatusBadge(task.status)}
                      </div>
                      <div className="w-full bg-surface-light rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>{Math.round(task.progress)}% complete</span>
                        <span>Started: {task.startTime}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* System Metrics */}
          <Card className="card">
            <h2 className="text-xl font-bold text-foreground mb-6">System Metrics</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={systemMetricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stackId="1"
                  stroke="var(--color-chart-1)"
                  fill="var(--color-chart-1)"
                  fillOpacity={0.3}
                  name="CPU %"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stackId="1"
                  stroke="var(--color-chart-2)"
                  fill="var(--color-chart-2)"
                  fillOpacity={0.3}
                  name="Memory %"
                />
                <Area
                  type="monotone"
                  dataKey="diskIO"
                  stackId="1"
                  stroke="var(--color-chart-3)"
                  fill="var(--color-chart-3)"
                  fillOpacity={0.3}
                  name="Disk I/O %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Task Details & Logs */}
        <div className="space-y-6">
          {selectedTaskData && (
            <Card className="card">
              <h3 className="text-lg font-bold text-foreground mb-4">{selectedTaskData.name}</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-text-muted mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTaskData.status)}
                    <span className="text-foreground font-medium capitalize">{selectedTaskData.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-2">Progress</p>
                  <p className="text-2xl font-bold text-accent">{Math.round(selectedTaskData.progress)}%</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-2">Estimated Time</p>
                  <p className="text-foreground font-medium">{selectedTaskData.estimatedTime}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Activity Logs */}
          <Card className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Activity Logs</h3>
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className="text-xs px-2 py-1 rounded bg-surface-light text-text-muted hover:text-foreground transition-colors"
              >
                {autoScroll ? "Auto" : "Manual"}
              </button>
            </div>
            <div className="bg-surface rounded p-3 h-64 overflow-y-auto space-y-2 font-mono text-xs">
              {selectedTaskData?.logs.map((log, idx) => (
                <div key={idx} className="text-text-muted">
                  <span className="text-accent">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
