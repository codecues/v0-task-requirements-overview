"use client"

import { Card } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import type { Task } from "@/lib/task-utils"

interface ResourceForecastProps {
  tasks: Task[]
  forecast: {
    period: string
    requiredResources: number
    totalEffort: number
  }[]
  totalHours: number
}

export default function ResourceForecast({ tasks, forecast, totalHours }: ResourceForecastProps) {
  if (tasks.length === 0) {
    return <div className="text-center py-4">No tasks to forecast resources for.</div>
  }

  const totalCost = tasks.reduce((sum, task) => sum + (task.cost || 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
          <p className="text-2xl font-bold mt-2">{tasks.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <h3 className="text-sm font-medium text-muted-foreground">Total Hours</h3>
          <p className="text-2xl font-bold mt-2">{totalHours}</p>
        </Card>
        <Card className="p-4 text-center">
          <h3 className="text-sm font-medium text-muted-foreground">Total Cost</h3>
          <p className="text-2xl font-bold mt-2">${totalCost}</p>
        </Card>
      </div>

      <div className="h-[300px]">
        <h3 className="text-lg font-medium mb-4">Resource Forecast</h3>
        <ChartContainer
          config={{
            resources: {
              label: "Required Resources",
              color: "hsl(var(--chart-1))",
            },
            effort: {
              label: "Total Effort (hours)",
              color: "hsl(var(--chart-2))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="requiredResources"
                stroke="var(--color-resources)"
                activeDot={{ r: 8 }}
              />
              <Line yAxisId="right" type="monotone" dataKey="totalEffort" stroke="var(--color-effort)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
