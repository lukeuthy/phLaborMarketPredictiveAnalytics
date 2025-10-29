"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function Settings() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-text-muted">Configure your analysis preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card className="card">
          <h2 className="text-xl font-bold text-foreground mb-6">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Default Algorithm</label>
              <select className="input-field">
                <option>SARIMA (Recommended)</option>
                <option>ARIMA</option>
                <option>LSTM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Forecast Horizon</label>
              <select className="input-field">
                <option>4 Quarters</option>
                <option>2 Quarters</option>
                <option>8 Quarters</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="card">
          <h2 className="text-xl font-bold text-foreground mb-6">Processing Options</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-foreground">Enable parallel processing</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-foreground">Auto-save results</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-foreground">Send notifications</span>
            </label>
          </div>
        </Card>

        <Button className="btn-primary">Save Settings</Button>
      </div>
    </div>
  )
}
