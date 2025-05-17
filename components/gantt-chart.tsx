"use client"

import { useState } from "react"
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import type { Task, Resource } from "@/lib/task-utils"

interface GanttChartProps {
  tasks: Task[]
  resources: Resource[]
}

export default function GanttChart({ tasks, resources }: GanttChartProps) {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  if (tasks.length === 0) {
    return <div className="text-center py-4">No tasks to display in the Gantt chart.</div>
  }

  // Get the date range to display
  const getDateRange = () => {
    if (viewMode === "day") {
      return [currentDate]
    } else if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start on Monday
      const end = endOfWeek(currentDate, { weekStartsOn: 1 }) // End on Sunday
      return eachDayOfInterval({ start, end })
    } else {
      // Month view - show 30 days
      const dates = []
      for (let i = 0; i < 30; i++) {
        dates.push(addDays(currentDate, i))
      }
      return dates
    }
  }

  const dateRange = getDateRange()

  // Function to get resource name
  const getResourceName = (resourceId?: string) => {
    if (!resourceId) return ""
    const resource = resources.find((r) => r.id === resourceId)
    return resource ? resource.name : ""
  }

  // Move backward
  const moveBackward = () => {
    if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, -1))
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, -7))
    } else {
      setCurrentDate(addDays(currentDate, -30))
    }
  }

  // Move forward
  const moveForward = () => {
    if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, 1))
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, 7))
    } else {
      setCurrentDate(addDays(currentDate, 30))
    }
  }

  // Reset to today
  const resetToToday = () => {
    setCurrentDate(new Date())
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

  // Prepare data for the chart
  const chartData = tasks.map((task) => {
    const start = new Date(task.startDate)
    const end = new Date(task.dueDate || task.startDate)

    return {
      id: task.id,
      name: task.name,
      owner: task.owner,
      size: task.size,
      start: start,
      end: end,
      dependencies: task.dependencies,
      resourceId: task.resourceId,
      resourceName: getResourceName(task.resourceId),
    }
  })

  // Calculate task position and width in the Gantt chart
  const getTaskPosition = (task: (typeof chartData)[0], dateRange: Date[]) => {
    const startDate = dateRange[0]
    const endDate = dateRange[dateRange.length - 1]

    // If task is outside the visible range
    if (task.end < startDate || task.start > endDate) {
      return { left: 0, width: 0, visible: false }
    }

    // Calculate position
    const rangeWidth = differenceInDays(endDate, startDate) + 1
    const taskStart = Math.max(0, differenceInDays(task.start, startDate))
    const taskEnd = Math.min(rangeWidth - 1, differenceInDays(task.end, startDate))
    const taskWidth = taskEnd - taskStart + 1

    const left = (taskStart / rangeWidth) * 100
    const width = (taskWidth / rangeWidth) * 100

    return { left: `${left}%`, width: `${width}%`, visible: true }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <button className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors" onClick={moveBackward}>
            <span>←</span>
          </button>
          <button className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors" onClick={resetToToday}>
            <span>Today</span>
          </button>
          <button className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors" onClick={moveForward}>
            <span>→</span>
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 ${
              viewMode === "day" ? "bg-primary-100 text-primary-700" : "bg-gray-100"
            } rounded hover:bg-gray-200 transition-colors text-sm`}
            onClick={() => setViewMode("day")}
          >
            Day
          </button>
          <button
            className={`px-3 py-1 ${
              viewMode === "week" ? "bg-primary-100 text-primary-700" : "bg-gray-100"
            } rounded hover:bg-gray-200 transition-colors text-sm`}
            onClick={() => setViewMode("week")}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 ${
              viewMode === "month" ? "bg-primary-100 text-primary-700" : "bg-gray-100"
            } rounded hover:bg-gray-200 transition-colors text-sm`}
            onClick={() => setViewMode("month")}
          >
            Month
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="flex border-b border-gray-200 pb-2">
          <div className="w-[180px] font-medium">Task</div>
          <div className="flex-1 flex">
            {dateRange.map((date, index) => (
              <div key={index} className={`flex-1 text-center text-sm ${index % 2 === 0 ? "bg-gray-50" : ""}`}>
                {format(date, "d MMM")}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {chartData.map((task) => {
            const position = getTaskPosition(task, dateRange)
            if (!position.visible) return null

            return (
              <div key={task.id} className="flex items-center">
                <div className="w-[180px] pr-4 font-medium truncate">{task.name}</div>
                <div className="flex-1 h-8 relative">
                  <div
                    className={`absolute top-1 ${getTaskColor(task.resourceId)} rounded flex items-center justify-center text-white text-xs`}
                    style={{ left: position.left, width: position.width }}
                  >
                    {task.resourceName ? `${task.resourceName.split(" ")[0]} (${task.size})` : task.size}
                  </div>

                  {/* Dependency arrows - simplified to avoid SVG issues */}
                  {task.dependencies?.map((depId) => {
                    const dependencyTask = chartData.find((t) => t.id === depId)
                    if (!dependencyTask) return null

                    const depPosition = getTaskPosition(dependencyTask, dateRange)
                    if (!depPosition.visible) return null

                    return (
                      <div
                        key={`${depId}-${task.id}`}
                        className="absolute border-t-2 border-dashed border-blue-500"
                        style={{
                          top: "50%",
                          left: depPosition.left,
                          width: `calc(${position.left} - ${depPosition.left})`,
                          height: "1px",
                        }}
                      ></div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
