"use client"

import type { Resource } from "@/lib/task-utils"

interface ResourceAvailabilityProps {
  resources: Resource[]
  availability: Record<
    string,
    {
      totalCapacity: number
      allocatedHours: number
      availableHours: number
      utilizationPercentage: number
      taskCount: number
      weeklyBreakdown: {
        week: string
        capacity: number
        allocated: number
        available: number
        utilization: number
      }[]
    }
  >
}

export default function ResourceAvailability({ resources, availability }: ResourceAvailabilityProps) {
  if (resources.length === 0) {
    return <div className="text-center py-4">No resources to display availability for.</div>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Showing resource availability for the next 3 weeks</p>

      <div className="grid grid-cols-1 gap-4">
        {resources.map((resource) => {
          const resourceAvailability = availability[resource.id] || {
            totalCapacity: 0,
            allocatedHours: 0,
            availableHours: 0,
            utilizationPercentage: 0,
            taskCount: 0,
            weeklyBreakdown: [],
          }

          return (
            <div key={resource.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">{resource.name}</h3>
                  <p className="text-sm text-gray-500">{resource.capacity} hours/week capacity</p>
                </div>
                <div className="mt-2 md:mt-0 text-right">
                  <div className="text-2xl font-bold">{resourceAvailability.utilizationPercentage}%</div>
                  <p className="text-sm text-gray-500">Overall Utilization</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`${
                    resourceAvailability.utilizationPercentage >= 90
                      ? "bg-red-500"
                      : resourceAvailability.utilizationPercentage >= 75
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  } h-2 rounded-full`}
                  style={{ width: `${resourceAvailability.utilizationPercentage}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Total Capacity</p>
                  <p className="text-lg font-medium">{resourceAvailability.totalCapacity} hrs</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Allocated</p>
                  <p className="text-lg font-medium">{resourceAvailability.allocatedHours} hrs</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-lg font-medium">{resourceAvailability.availableHours} hrs</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned Tasks</p>
                  <p className="text-lg font-medium">{resourceAvailability.taskCount}</p>
                </div>
              </div>

              {resourceAvailability.weeklyBreakdown.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Weekly Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {resourceAvailability.weeklyBreakdown.map((week, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <h5 className="text-sm font-medium">{week.week}</h5>
                        <div className="w-full bg-gray-200 rounded-full h-1 my-2">
                          <div
                            className={`${
                              week.utilization >= 90
                                ? "bg-red-500"
                                : week.utilization >= 75
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            } h-1 rounded-full`}
                            style={{ width: `${week.utilization}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-3 text-xs">
                          <div>
                            <p className="text-gray-500">Capacity</p>
                            <p>{week.capacity} hrs</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Allocated</p>
                            <p>{Math.round(week.allocated)} hrs</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Available</p>
                            <p>{Math.round(week.available)} hrs</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="text-sm">
                  {resourceAvailability.utilizationPercentage >= 90 ? (
                    <span className="text-red-500 font-medium">Overallocated</span>
                  ) : resourceAvailability.utilizationPercentage >= 75 ? (
                    <span className="text-amber-500 font-medium">Near capacity</span>
                  ) : (
                    <span className="text-green-500 font-medium">Available for more tasks</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
