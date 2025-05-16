"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Pie, PieChart } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { format } from "date-fns"
import type { Task, Resource } from "@/lib/task-utils"
import { sizeMap } from "@/lib/config"

interface ReportsProps {
  tasks: Task[]
  resources: Resource[]
  totalHours: number
  resourceAvailability: Record<
    string,
    {
      totalCapacity: number
      allocatedHours: number
      availableHours: number
      utilizationPercentage: number
      taskCount: number
      weeklyBreakdown?: {
        week: string
        capacity: number
        allocated: number
        available: number
        utilization: number
      }[]
    }
  >
}

export default function Reports({ tasks, resources, totalHours, resourceAvailability }: ReportsProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Reports</CardTitle>
          <CardDescription>No tasks available to generate reports.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Calculate total cost
  const totalCost = tasks.reduce((sum, task) => sum + (task.cost || 0), 0)

  // Calculate task distribution by size
  const tasksBySize: Record<string, number> = {}
  tasks.forEach((task) => {
    tasksBySize[task.size] = (tasksBySize[task.size] || 0) + 1
  })
  const taskSizeData = Object.entries(tasksBySize).map(([size, count]) => ({
    name: size,
    value: count,
  }))

  // Calculate task distribution by resource
  const tasksByResource: Record<string, number> = {}
  tasks.forEach((task) => {
    const resourceId = task.resourceId || "Unassigned"
    tasksByResource[resourceId] = (tasksByResource[resourceId] || 0) + 1
  })
  const taskResourceData = Object.entries(tasksByResource).map(([resourceId, count]) => ({
    name: resourceId === "Unassigned" ? "Unassigned" : resources.find((r) => r.id === resourceId)?.name || "Unknown",
    value: count,
  }))

  // Calculate hours by resource
  const hoursByResource: Record<string, number> = {}
  tasks.forEach((task) => {
    const resourceId = task.resourceId || "Unassigned"
    hoursByResource[resourceId] = (hoursByResource[resourceId] || 0) + (sizeMap[task.size] || 0)
  })
  const hoursResourceData = Object.entries(hoursByResource).map(([resourceId, hours]) => ({
    name: resourceId === "Unassigned" ? "Unassigned" : resources.find((r) => r.id === resourceId)?.name || "Unknown",
    hours,
  }))

  // Calculate upcoming deadlines
  const today = new Date()
  const upcomingDeadlines = tasks
    .filter((task) => task.dueDate && new Date(task.dueDate) >= today)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  // Calculate resource utilization
  const resourceUtilization = resources.map((resource) => {
    const availability = resourceAvailability[resource.id] || {
      totalCapacity: 0,
      allocatedHours: 0,
      availableHours: 0,
      utilizationPercentage: 0,
      taskCount: 0,
    }
    return {
      name: resource.name,
      utilization: availability.utilizationPercentage,
      allocated: availability.allocatedHours,
      available: availability.availableHours,
    }
  })

  // Calculate dependency statistics
  const tasksWithDependencies = tasks.filter((task) => task.dependencies && task.dependencies.length > 0).length
  const totalDependencies = tasks.reduce((sum, task) => sum + (task.dependencies?.length || 0), 0)

  // COLORS
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <Card className="p-4 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Resources</h3>
              <p className="text-2xl font-bold mt-2">{resources.length}</p>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution by Size</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskSizeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskSizeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Allocation</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceUtilization} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => [`${value}%`, "Utilization"]} />
                  <Bar dataKey="utilization" fill="#8884d8">
                    {resourceUtilization.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.utilization >= 100 ? "#ef4444" : entry.utilization >= 80 ? "#f59e0b" : "#22c55e"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Resource</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingDeadlines.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>{task.size}</TableCell>
                      <TableCell>{format(new Date(task.dueDate!), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        {task.resourceId
                          ? resources.find((r) => r.id === task.resourceId)?.name || "Unknown"
                          : "Unassigned"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4">No upcoming deadlines.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dependency Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Tasks with Dependencies</h3>
                  <p className="text-2xl font-bold mt-2">
                    {tasksWithDependencies} ({Math.round((tasksWithDependencies / tasks.length) * 100)}%)
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Dependencies</h3>
                  <p className="text-2xl font-bold mt-2">{totalDependencies}</p>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Tasks with Most Dependencies</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Dependencies</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks
                      .filter((task) => task.dependencies && task.dependencies.length > 0)
                      .sort((a, b) => (b.dependencies?.length || 0) - (a.dependencies?.length || 0))
                      .slice(0, 3)
                      .map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.name}</TableCell>
                          <TableCell>{task.dependencies?.length}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hours by Resource</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursResourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} hours`, "Allocated"]} />
                <Bar dataKey="hours" fill="#8884d8">
                  {hoursResourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
