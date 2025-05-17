"use client"

import type { Task } from "@/lib/task-utils"
import { sizeMap } from "@/lib/config"

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

  // Calculate available capacity for different task sizes
  const calculateAvailableCapacity = () => {
    const totalCapacity = 120 // Example: 3 resources with 40 hours each
    const remainingCapacity = Math.max(0, totalCapacity - totalHours)

    return {
      XS: Math.floor(remainingCapacity / sizeMap.XS),
      S: Math.floor(remainingCapacity / sizeMap.S),
      M: Math.floor(remainingCapacity / sizeMap.M),
      L: Math.floor(remainingCapacity / sizeMap.L),
      XL: Math.floor(remainingCapacity / sizeMap.XL),
    }
  }

  const capacity = calculateAvailableCapacity()

  // Mock resource utilization data
  const resourceUtilization = [
    { name: "Sarah Johnson", hours: 32, capacity: 40, utilization: 80 },
    { name: "Mike Chen", hours: 24, capacity: 40, utilization: 60 },
    { name: "Alex Rodriguez", hours: 38, capacity: 40, utilization: 95 },
  ]

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Next 3 Weeks</span>
          <span className="text-sm text-gray-500">Hours / Capacity</span>
        </div>
        <div className="space-y-4">
          {resourceUtilization.map((resource, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span>{resource.name}</span>
                <span>
                  {resource.hours}/{resource.capacity}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${resource.utilization >= 90 ? "bg-red-500" : "bg-primary-500"} h-2 rounded-full`}
                  style={{ width: `${resource.utilization}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium mb-3">Available Capacity</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 p-2 rounded border border-green-100">
            <div className="text-green-600 font-bold text-lg">{capacity.XS}</div>
            <div className="text-xs">XS Tasks</div>
          </div>
          <div className="bg-green-50 p-2 rounded border border-green-100">
            <div className="text-green-600 font-bold text-lg">{capacity.S}</div>
            <div className="text-xs">S Tasks</div>
          </div>
          <div className="bg-green-50 p-2 rounded border border-green-100">
            <div className="text-green-600 font-bold text-lg">{capacity.M}</div>
            <div className="text-xs">M Tasks</div>
          </div>
          <div
            className={`${capacity.L < 3 ? "bg-yellow-50 border-yellow-100" : "bg-green-50 border-green-100"} p-2 rounded border`}
          >
            <div className={`${capacity.L < 3 ? "text-yellow-600" : "text-green-600"} font-bold text-lg`}>
              {capacity.L}
            </div>
            <div className="text-xs">L Tasks</div>
          </div>
          <div
            className={`${capacity.XL < 2 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"} p-2 rounded border`}
          >
            <div className={`${capacity.XL < 2 ? "text-red-600" : "text-green-600"} font-bold text-lg`}>
              {capacity.XL}
            </div>
            <div className="text-xs">XL Tasks</div>
          </div>
          <div className="bg-primary-50 p-2 rounded border border-primary-100">
            <div className="text-primary-600 font-bold text-lg">{totalHours}</div>
            <div className="text-xs">Hrs Total</div>
          </div>
        </div>
      </div>
    </div>
  )
}
