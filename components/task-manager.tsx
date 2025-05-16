"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TaskForm from "./task-form"
import TaskList from "./task-list"
import GanttChart from "./gantt-chart"
import ResourceForecast from "./resource-forecast"
import CostConfig from "./cost-config"
import ResourceManager from "./resource-manager"
import ResourceAvailability from "./resource-availability"
import Reports from "./reports"
import {
  type Task,
  type Resource,
  calculateETA,
  calculateResourceForecast,
  calculateTotalHours,
  calculateResourceAvailability,
  calculateTaskCapacity,
} from "@/lib/task-utils"
import { holidays, costMap as defaultCostMap, sizeMap } from "@/lib/config"
import { addMonths } from "date-fns"

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [activeTab, setActiveTab] = useState("tasks")
  const [costMap, setCostMap] = useState(defaultCostMap)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Load tasks, resources, and cost configuration from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }

    const savedResources = localStorage.getItem("resources")
    if (savedResources) {
      setResources(JSON.parse(savedResources))
    }

    const savedCostMap = localStorage.getItem("costMap")
    if (savedCostMap) {
      setCostMap(JSON.parse(savedCostMap))
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  // Save resources to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("resources", JSON.stringify(resources))
  }, [resources])

  // Save cost map to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("costMap", JSON.stringify(costMap))
  }, [costMap])

  const addTask = (task: Task) => {
    // Calculate ETA if due date is not provided
    if (!task.dueDate) {
      task.dueDate = calculateETA(task.startDate, task.size, holidays, tasks, task.dependencies)
    }

    // Calculate cost based on size
    task.cost = task.cost || costMap[task.size] || 0

    // Calculate hours based on size
    task.hours = task.hours || sizeMap[task.size] || 0

    // Generate a unique ID if not provided (for new tasks)
    if (!task.id) {
      task.id = Date.now().toString()
    }

    // If we're editing an existing task, replace it
    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)))
      setEditingTask(null)
    } else {
      // Otherwise add as a new task
      setTasks([...tasks, task])
    }
  }

  const editTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      setEditingTask(task)
      setActiveTab("tasks") // Switch to tasks tab for editing
    }
  }

  const cancelEdit = () => {
    setEditingTask(null)
  }

  const deleteTask = (taskId: string) => {
    // Check if any tasks depend on this one
    const dependentTasks = tasks.filter((task) => task.dependencies && task.dependencies.includes(taskId))

    if (dependentTasks.length > 0) {
      alert(`Cannot delete this task as it is a dependency for: ${dependentTasks.map((t) => t.name).join(", ")}`)
      return
    }

    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const updateCosts = (newCostMap: Record<string, number>) => {
    setCostMap(newCostMap)

    // Update costs for existing tasks
    const updatedTasks = tasks.map((task) => ({
      ...task,
      cost: newCostMap[task.size] || task.cost,
    }))

    setTasks(updatedTasks)
  }

  const addResource = (resource: Resource) => {
    // Generate a unique ID if not provided
    if (!resource.id) {
      resource.id = `resource-${Date.now()}`
    }

    setResources([...resources, resource])
  }

  const updateResource = (updatedResource: Resource) => {
    setResources(resources.map((r) => (r.id === updatedResource.id ? updatedResource : r)))
  }

  const deleteResource = (resourceId: string) => {
    // Check if any tasks are assigned to this resource
    const assignedTasks = tasks.filter((task) => task.resourceId === resourceId)

    if (assignedTasks.length > 0) {
      alert(
        `Cannot delete this resource as it is assigned to ${assignedTasks.length} tasks. Please reassign these tasks first.`,
      )
      return
    }

    setResources(resources.filter((r) => r.id !== resourceId))
  }

  // Calculate resource forecast and availability
  const resourceForecast = calculateResourceForecast(tasks, resources)
  const taskCapacity = calculateTaskCapacity(tasks)
  const totalHours = calculateTotalHours(tasks)

  // Calculate resource availability for the next 3 months
  const today = new Date()
  const threeMonthsLater = addMonths(today, 3)
  const resourceAvailability = calculateResourceAvailability(tasks, resources, today, threeMonthsLater)

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingTask ? "Edit Task" : "Add New Task"}</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm
                onAddTask={addTask}
                existingTasks={tasks}
                resources={resources}
                editingTask={editingTask}
                onCancelEdit={cancelEdit}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task List</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList tasks={tasks} onDeleteTask={deleteTask} onEditTask={editTask} resources={resources} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gantt">
          <Card>
            <CardHeader>
              <CardTitle>Gantt Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <GanttChart tasks={tasks} resources={resources} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <ResourceManager
            resources={resources}
            onAddResource={addResource}
            onUpdateResource={updateResource}
            onDeleteResource={deleteResource}
          />
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resource Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceForecast tasks={tasks} forecast={resourceForecast} totalHours={totalHours} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>Resource Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceAvailability resources={resources} availability={resourceAvailability} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <CostConfig onUpdateCosts={updateCosts} />
        </TabsContent>

        <TabsContent value="reports">
          <Reports
            tasks={tasks}
            resources={resources}
            totalHours={totalHours}
            resourceAvailability={resourceAvailability}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
