import { addDays, isWeekend, format, startOfWeek, isWithinInterval, differenceInDays } from "date-fns"
import { sizeMap } from "./config"

export interface Resource {
  id: string
  name: string
  capacity: number // hours per week
}

export interface Task {
  id: string
  name: string
  owner: string
  size: "XS" | "S" | "M" | "L" | "XL"
  startDate: Date
  dueDate?: Date
  cost?: number
  hours?: number
  dependencies?: string[] // Add dependencies array
  resourceId?: string // Reference to assigned resource
}

// Calculate ETA based on start date, size, and holidays
export function calculateETA(
  startDate: Date,
  size: string,
  holidays: Date[],
  tasks?: Task[],
  dependencies?: string[],
): Date {
  const hoursPerDay = 8 // Configurable working hours per day
  const hours = sizeMap[size as keyof typeof sizeMap] || 0
  const workingDays = Math.ceil(hours / hoursPerDay)

  // If there are dependencies, find the latest end date among them
  let effectiveStartDate = new Date(startDate)

  if (dependencies && dependencies.length > 0 && tasks) {
    const dependencyTasks = tasks.filter((task) => dependencies.includes(task.id))
    if (dependencyTasks.length > 0) {
      const latestEndDate = new Date(
        Math.max(
          ...dependencyTasks.map((task) =>
            task.dueDate ? new Date(task.dueDate).getTime() : new Date(task.startDate).getTime(),
          ),
        ),
      )

      // If the latest dependency end date is after the planned start date, use that instead
      if (latestEndDate > effectiveStartDate) {
        effectiveStartDate = latestEndDate
      }
    }
  }

  let currentDate = new Date(effectiveStartDate)
  let daysAdded = 0

  while (daysAdded < workingDays) {
    currentDate = addDays(currentDate, 1)

    // Skip weekends
    if (isWeekend(currentDate)) {
      continue
    }

    // Skip holidays
    const isHoliday = holidays.some((holiday) => format(holiday, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd"))

    if (isHoliday) {
      continue
    }

    daysAdded++
  }

  return currentDate
}

// Calculate resource forecast
export function calculateResourceForecast(tasks: Task[], resources: Resource[]) {
  const forecast: { period: string; requiredResources: number; totalEffort: number }[] = []

  // Group tasks by week
  const weekMap = new Map<string, { totalHours: number; resourceHours: Record<string, number> }>()

  // Process each task
  tasks.forEach((task) => {
    const hours = sizeMap[task.size] || 0
    const startDate = new Date(task.startDate)
    const endDate = new Date(task.dueDate || task.startDate)

    // Distribute hours evenly across the task duration
    let currentDate = new Date(startDate)
    const taskDurationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const hoursPerDay = hours / taskDurationDays

    while (currentDate <= endDate) {
      if (!isWeekend(currentDate)) {
        const weekStart = format(startOfWeek(currentDate), "yyyy-MM-dd")
        const existing = weekMap.get(weekStart) || { totalHours: 0, resourceHours: {} }

        existing.totalHours += hoursPerDay

        // Track hours by resource
        if (task.resourceId) {
          existing.resourceHours[task.resourceId] = (existing.resourceHours[task.resourceId] || 0) + hoursPerDay
        }

        weekMap.set(weekStart, existing)
      }
      currentDate = addDays(currentDate, 1)
    }
  })

  // Convert map to array for chart
  Array.from(weekMap.entries()).forEach(([weekStart, data]) => {
    forecast.push({
      period: format(new Date(weekStart), "MMM d"),
      totalEffort: Math.round(data.totalHours),
      requiredResources: Math.ceil(data.totalHours / 40), // Assuming 40 hours per resource per week
    })
  })

  // Sort by date
  forecast.sort((a, b) => {
    const dateA = new Date(a.period)
    const dateB = new Date(b.period)
    return dateA.getTime() - dateB.getTime()
  })

  return forecast
}

// Calculate how many more tasks of each size can be added based on available capacity
export function calculateTaskCapacity(tasks: Task[]) {
  // Calculate total capacity from resources
  const resourceCapacity = 40 // Default if no resources
  const weeksAhead = 4 // Look 4 weeks ahead

  // Calculate total hours already allocated
  const totalHoursAllocated = tasks.reduce((sum, task) => {
    return sum + (sizeMap[task.size] || 0)
  }, 0)

  // Calculate total available capacity
  const totalCapacity = resourceCapacity * weeksAhead
  const remainingCapacity = Math.max(0, totalCapacity - totalHoursAllocated)

  // Calculate how many tasks of each size can be added
  const capacity: Record<string, number> = {}

  Object.entries(sizeMap).forEach(([size, hours]) => {
    capacity[size] = Math.floor(remainingCapacity / hours)
  })

  return capacity
}

// Calculate resource availability
export function calculateResourceAvailability(tasks: Task[], resources: Resource[]) {
  try {
    const startDate = new Date() // Today
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 21) // 3 weeks from today

    const resourceAvailability: Record<
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
    > = {}

    // Initialize availability for all resources
    resources.forEach((resource) => {
      // Calculate total capacity for the date range (excluding weekends)
      let totalCapacity = 0
      let currentDate = new Date(startDate)

      // Create weekly breakdown
      const weeklyBreakdown = []
      let weekStart = new Date(currentDate)
      let weekCapacity = 0
      let weekNumber = 1

      while (currentDate <= endDate) {
        if (!isWeekend(currentDate)) {
          totalCapacity += 8 // 8 hours per working day
          weekCapacity += 8
        }

        // If we've processed 7 days or reached the end date, add the week to the breakdown
        if (differenceInDays(currentDate, weekStart) === 6 || currentDate.getTime() === endDate.getTime()) {
          weeklyBreakdown.push({
            week: `Week ${weekNumber}`,
            capacity: weekCapacity,
            allocated: 0,
            available: weekCapacity,
            utilization: 0,
          })

          weekStart = addDays(currentDate, 1)
          weekCapacity = 0
          weekNumber++
        }

        currentDate = addDays(currentDate, 1)
      }

      resourceAvailability[resource.id] = {
        totalCapacity,
        allocatedHours: 0,
        availableHours: totalCapacity,
        utilizationPercentage: 0,
        taskCount: 0,
        weeklyBreakdown,
      }
    })

    // Calculate allocated hours for each resource
    tasks.forEach((task) => {
      if (!task.resourceId) return

      const taskStartDate = new Date(task.startDate)
      const taskEndDate = new Date(task.dueDate || task.startDate)
      const hours = sizeMap[task.size] || 0

      // Only count tasks that overlap with the specified date range
      if (
        (taskStartDate <= endDate && taskEndDate >= startDate) ||
        isWithinInterval(taskStartDate, { start: startDate, end: endDate }) ||
        isWithinInterval(taskEndDate, { start: startDate, end: endDate })
      ) {
        if (resourceAvailability[task.resourceId]) {
          resourceAvailability[task.resourceId].allocatedHours += hours
          resourceAvailability[task.resourceId].taskCount += 1

          // Distribute hours across weeks
          const taskDurationDays = Math.max(1, differenceInDays(taskEndDate, taskStartDate) + 1)
          const hoursPerDay = hours / taskDurationDays

          let currentDate = new Date(Math.max(taskStartDate.getTime(), startDate.getTime()))
          const effectiveEndDate = new Date(Math.min(taskEndDate.getTime(), endDate.getTime()))

          while (currentDate <= effectiveEndDate) {
            if (!isWeekend(currentDate)) {
              // Find which week this date belongs to
              const weekIndex = Math.floor(differenceInDays(currentDate, startDate) / 7)
              if (weekIndex >= 0 && weekIndex < resourceAvailability[task.resourceId].weeklyBreakdown.length) {
                resourceAvailability[task.resourceId].weeklyBreakdown[weekIndex].allocated += hoursPerDay
              }
            }
            currentDate = addDays(currentDate, 1)
          }
        }
      }
    })

    // Calculate available hours and utilization percentage
    Object.keys(resourceAvailability).forEach((resourceId) => {
      const resource = resourceAvailability[resourceId]
      resource.availableHours = Math.max(0, resource.totalCapacity - resource.allocatedHours)
      resource.utilizationPercentage =
        resource.totalCapacity > 0
          ? Math.min(100, Math.round((resource.allocatedHours / resource.totalCapacity) * 100))
          : 0

      // Update weekly breakdown
      resource.weeklyBreakdown.forEach((week) => {
        week.available = Math.max(0, week.capacity - week.allocated)
        week.utilization = week.capacity > 0 ? Math.min(100, Math.round((week.allocated / week.capacity) * 100)) : 0
      })
    })

    return resourceAvailability
  } catch (error) {
    console.error("Error in calculateResourceAvailability:", error)
    return {}
  }
}

// Get total hours for a task
export function getTaskHours(task: Task): number {
  return sizeMap[task.size] || 0
}

// Calculate total hours for all tasks
export function calculateTotalHours(tasks: Task[]): number {
  return tasks.reduce((total, task) => total + getTaskHours(task), 0)
}
