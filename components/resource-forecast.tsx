"use client"

import type { Task, Resource } from "@/lib/task-utils"
import { sizeMap } from "@/lib/config"

interface ResourceForecastProps {
  tasks: Task[]
  forecast: {
    period: string
    requiredResources: number
    totalEffort: number
  }[]
  totalHours: number
  resources: Resource[] // Add resources prop
}

export default function ResourceForecast({ tasks, forecast, totalHours, resources }: ResourceForecastProps) {
  if (tasks.length === 0) {
    return <div className="text-center py-4">No tasks to forecast resources for.</div>
  }

  const totalCost = tasks.reduce((sum, task) => sum + (task.cost || 0), 0)

  // Calculate available capacity for different task sizes
  const calculateAvailableCapacity = () => {
    // Calculate total capacity from actual resources
    const totalCapacity = resources.reduce((sum, resource) => sum + resource.capacity, 0)
    const remainingCapacity = Math.max(0, totalCapacity - totalHours)

    return {
      XS: Math.floor(remainingCapacity / sizeMap.XS),
      S: Math.floor(remainingCapacity / sizeMap.S),
      M: Math.floor(remainingCapacity / sizeMap.M),
      L: Math.floor(remainingCapacity / sizeMap.L),
      XL: Math.floor(remainingCapacity / sizeMap.XL),
      total: remainingCapacity,
    }
  }

  const capacity = calculateAvailableCapacity()

  // Calculate resource utilization from actual tasks and resources
  const calculateResourceUtilization = () => {
    const utilization = resources.map((resource) => {
      // Get all tasks assigned to this resource
      const resourceTasks = tasks.filter((task) => task.resourceId === resource.id)

      // Calculate total hours assigned to this resource
      const assignedHours = resourceTasks.reduce((sum, task) => sum + (task.hours || 0), 0)

      // Calculate utilization percentage
      const utilizationPercentage = Math.min(100, Math.round((assignedHours / resource.capacity) * 100))

      return {
        name: resource.name,
        hours: assignedHours,
        capacity: resource.capacity,
        utilization: utilizationPercentage,
      }
    })

    return utilization
  }

  let resourceUtilization = []
  try {
    resourceUtilization = calculateResourceUtilization()
  } catch (error) {
    console.error("Error calculating resource utilization:", error)
    resourceUtilization = []
  }

  return (
    <div>
      {resources.length > 0 ? (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Resource Utilization</span>
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
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 text-center text-gray-500">
          No resources added yet. Add resources to see utilization.
        </div>
      )}

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
            <div className="text-primary-600 font-bold text-lg">{capacity.total}</div>
            <div className="text-xs">Hrs Available</div>
          </div>
        </div>
      </div>
    </div>
  )
}
