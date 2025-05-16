"use client"

import { useState } from "react"
import { format, differenceInDays, addDays } from "date-fns"
import type { Task, Resource } from "@/lib/task-utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface GanttChartProps {
  tasks: Task[]
  resources: Resource[]
}

export default function GanttChart({ tasks, resources }: GanttChartProps) {
  const [viewRange, setViewRange] = useState<number>(30) // Days to show
  const [startViewDate, setStartViewDate] = useState<Date>(new Date())

  if (tasks.length === 0) {
    return <div className="text-center py-4">No tasks to display in the Gantt chart.</div>
  }

  // Find the earliest start date and latest end date
  const earliestDate = new Date(Math.min(...tasks.map((task) => new Date(task.startDate).getTime())))
  const latestDate = new Date(Math.max(...tasks.map((task) => new Date(task.dueDate || task.startDate).getTime())))

  // Set the view range to include all tasks if not already set
  if (differenceInDays(latestDate, earliestDate) > viewRange) {
    setViewRange(differenceInDays(latestDate, earliestDate) + 7) // Add a week buffer
  }

  // Generate date labels for the x-axis
  const dateLabels = Array.from({ length: viewRange }, (_, i) => {
    const date = addDays(startViewDate, i)
    return format(date, "MMM d")
  })

  // Function to get resource name
  const getResourceName = (resourceId?: string) => {
    if (!resourceId) return ""
    const resource = resources.find((r) => r.id === resourceId)
    return resource ? resource.name : ""
  }

  // Prepare data for the chart
  const chartData = tasks.map((task, index) => {
    const start = new Date(task.startDate)
    const end = new Date(task.dueDate || task.startDate)

    // Calculate position and width for the Gantt bar
    const startOffset = Math.max(0, differenceInDays(start, startViewDate))
    const duration = differenceInDays(end, start) + 1 // +1 to include the end day

    return {
      id: task.id,
      name: task.name,
      owner: task.owner,
      size: task.size,
      start: start,
      end: end,
      startOffset: startOffset,
      duration: duration,
      // For proper positioning in the chart
      index: index, // Use index for Y-axis positioning
      dependencies: task.dependencies,
      resourceId: task.resourceId,
      resourceName: getResourceName(task.resourceId),
    }
  })

  // Move view range backward
  const moveBackward = () => {
    setStartViewDate(addDays(startViewDate, -viewRange / 2))
  }

  // Move view range forward
  const moveForward = () => {
    setStartViewDate(addDays(startViewDate, viewRange / 2))
  }

  // Reset view to today
  const resetView = () => {
    setStartViewDate(new Date())
  }

  // Change view range
  const changeViewRange = (days: number) => {
    setViewRange(days)
  }

  // Get color based on resource
  const getTaskColor = (resourceId?: string) => {
    if (!resourceId) return "bg-gray-500"

    // Generate a consistent color based on resourceId
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
      "bg-orange-500",
    ]

    const index = resources.findIndex((r) => r.id === resourceId)
    return colors[index % colors.length]
  }

  // Custom rendering for the Gantt chart
  const renderCustomizedGanttChart = () => {
    return (
      <div className="relative h-[500px] w-full border rounded-md">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Date headers */}
          <div className="flex border-b h-10 bg-muted/50">
            <div className="w-[200px] border-r bg-background flex items-center px-2 font-medium">Task / Resource</div>
            <div className="flex-1 flex">
              {dateLabels.map((label, i) => (
                <div key={i} className="flex-1 text-center text-xs p-1 border-r flex items-center justify-center">
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          <div className="overflow-y-auto h-[calc(100%-40px)]">
            {chartData.map((task, taskIndex) => (
              <div key={task.id} className="flex relative h-14 border-b hover:bg-muted/20">
                {/* Task name and resource */}
                <div className="absolute left-0 top-0 w-[200px] h-full flex flex-col justify-center px-2 bg-background z-10 border-r">
                  <span className="truncate text-sm font-medium">{task.name}</span>
                  {task.resourceName && (
                    <span className="truncate text-xs text-muted-foreground">{task.resourceName}</span>
                  )}
                </div>

                {/* Task bar container */}
                <div className="ml-[200px] w-[calc(100%-200px)] relative">
                  {/* Task bar */}
                  <div
                    className={`absolute h-8 top-3 ${getTaskColor(task.resourceId)} rounded-sm`}
                    style={{
                      left: `${(task.startOffset / viewRange) * 100}%`,
                      width: `${(task.duration / viewRange) * 100}%`,
                    }}
                  >
                    <div className="h-full px-2 flex items-center text-white text-xs truncate">
                      {task.name} ({format(task.start, "MMM d")} - {format(task.end, "MMM d")})
                    </div>
                  </div>

                  {/* Dependency arrows */}
                  {task.dependencies?.map((depId) => {
                    const dependencyTask = chartData.find((t) => t.id === depId)
                    if (!dependencyTask) return null

                    // Calculate positions for the dependency arrow
                    const depEndOffset = ((dependencyTask.startOffset + dependencyTask.duration) / viewRange) * 100
                    const taskStartOffset = (task.startOffset / viewRange) * 100
                    const depTaskIndex = chartData.findIndex((t) => t.id === depId)

                    // Draw a line from the end of the dependency to the start of this task
                    return (
                      <svg
                        key={`${depId}-${task.id}`}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        style={{ zIndex: 5 }}
                      >
                        <defs>
                          <marker
                            id={`arrowhead-${depId}-${task.id}`}
                            markerWidth="10"
                            markerHeight="7"
                            refX="0"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#444" />
                          </marker>
                        </defs>
                        <path
                          d={`M ${depEndOffset}% ${depTaskIndex * 14 + 7} 
                           L ${depEndOffset + 2}% ${depTaskIndex * 14 + 7} 
                           L ${depEndOffset + 2}% ${(depTaskIndex * 14 + 7 + taskIndex * 14 + 7) / 2} 
                           L ${taskStartOffset - 2}% ${(depTaskIndex * 14 + 7 + taskIndex * 14 + 7) / 2} 
                           L ${taskStartOffset - 2}% ${taskIndex * 14 + 7} 
                           L ${taskStartOffset}% ${taskIndex * 14 + 7}`}
                          stroke="#444"
                          strokeWidth="2"
                          fill="none"
                          markerEnd={`url(#arrowhead-${depId}-${task.id})`}
                        />
                      </svg>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => changeViewRange(14)}>
            2 Weeks
          </Button>
          <Button variant="outline" size="sm" onClick={() => changeViewRange(30)}>
            1 Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => changeViewRange(90)}>
            3 Months
          </Button>
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="icon" onClick={moveBackward}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={moveForward}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {renderCustomizedGanttChart()}
    </div>
  )
}
