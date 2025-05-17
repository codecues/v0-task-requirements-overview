"use client"

import { useState, useEffect } from "react"
import TaskForm from "./task-form"
import TaskList from "./task-list"
import GanttChart from "./gantt-chart"
import ResourceForecast from "./resource-forecast"
import CostConfig from "./cost-config"
import ResourceManager from "./resource-manager"
import ResourceAvailability from "./resource-availability"
import {
  type Task,
  type Resource,
  calculateETA,
  calculateResourceForecast,
  calculateTotalHours,
  calculateResourceAvailability,
  calculateTaskCapacity,
} from "@/lib/task-utils"
import { holidays, costMap as defaultCostMap } from "@/lib/config"
import { addWeeks } from "date-fns"

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

  // Calculate resource availability for the next 3 weeks
  const today = new Date()
  const threeWeeksLater = addWeeks(today, 3)
  const resourceAvailability = calculateResourceAvailability(tasks, resources, today, threeWeeksLater)

  return (
    <div>
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`px-4 py-3 font-medium border-b-2 ${
            activeTab === "tasks"
              ? "border-primary-500 text-primary-700"
              : "border-transparent hover:border-primary-300 hover:text-primary-600"
          } transition-colors`}
          onClick={() => setActiveTab("tasks")}
        >
          Tasks
        </button>
        <button
          className={`px-4 py-3 font-medium border-b-2 ${
            activeTab === "resources"
              ? "border-primary-500 text-primary-700"
              : "border-transparent hover:border-primary-300 hover:text-primary-600"
          } transition-colors`}
          onClick={() => setActiveTab("resources")}
        >
          Resources
        </button>
        <button
          className={`px-4 py-3 font-medium border-b-2 ${
            activeTab === "availability"
              ? "border-primary-500 text-primary-700"
              : "border-transparent hover:border-primary-300 hover:text-primary-600"
          } transition-colors`}
          onClick={() => setActiveTab("availability")}
        >
          Availability
        </button>
        <button
          className={`px-4 py-3 font-medium border-b-2 ${
            activeTab === "gantt"
              ? "border-primary-500 text-primary-700"
              : "border-transparent hover:border-primary-300 hover:text-primary-600"
          } transition-colors`}
          onClick={() => setActiveTab("gantt")}
        >
          Gantt Chart
        </button>
        <button
          className={`px-4 py-3 font-medium border-b-2 ${
            activeTab === "config"
              ? "border-primary-500 text-primary-700"
              : "border-transparent hover:border-primary-300 hover:text-primary-600"
          } transition-colors`}
          onClick={() => setActiveTab("config")}
        >
          Configuration
        </button>
      </div>

      {activeTab === "tasks" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-50 p-5 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">{editingTask ? "Edit Task" : "Task Entry Form"}</h2>
              <TaskForm
                onAddTask={addTask}
                existingTasks={tasks}
                resources={resources}
                editingTask={editingTask}
                onCancelEdit={cancelEdit}
              />
            </div>
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Resource Forecast</h2>
              <ResourceForecast tasks={tasks} forecast={resourceForecast} totalHours={totalHours} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Task List</h2>
            <TaskList tasks={tasks} onDeleteTask={deleteTask} onEditTask={editTask} resources={resources} />
          </div>
        </div>
      )}

      {activeTab === "gantt" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
          <GanttChart tasks={tasks} resources={resources} />
        </div>
      )}

      {activeTab === "resources" && (
        <ResourceManager
          resources={resources}
          onAddResource={addResource}
          onUpdateResource={updateResource}
          onDeleteResource={deleteResource}
        />
      )}

      {activeTab === "availability" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Resource Availability</h2>
          <ResourceAvailability resources={resources} availability={resourceAvailability} />
        </div>
      )}

      {activeTab === "config" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <CostConfig onUpdateCosts={updateCosts} />
        </div>
      )}
    </div>
  )
}
