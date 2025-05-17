"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import type { Task, Resource } from "@/lib/task-utils"
import { costMap, sizeMap } from "@/lib/config"

interface TaskFormProps {
  onAddTask: (task: Task) => void
  existingTasks: Task[]
  resources: Resource[]
  editingTask: Task | null
  onCancelEdit: () => void
}

export default function TaskForm({ onAddTask, existingTasks, resources, editingTask, onCancelEdit }: TaskFormProps) {
  const [taskName, setTaskName] = useState("")
  const [owner, setOwner] = useState("")
  const [size, setSize] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [error, setError] = useState("")
  const [dependencies, setDependencies] = useState<string[]>([])
  const [taskCost, setTaskCost] = useState<number | undefined>(undefined)
  const [resourceId, setResourceId] = useState<string>("")

  // Initialize form when editing task
  useEffect(() => {
    if (editingTask) {
      setTaskName(editingTask.name)
      setOwner(editingTask.owner)
      setSize(editingTask.size)
      setStartDate(new Date(editingTask.startDate))
      setDueDate(editingTask.dueDate ? new Date(editingTask.dueDate) : undefined)
      setDependencies(editingTask.dependencies || [])
      setTaskCost(editingTask.cost)
      setResourceId(editingTask.resourceId || "")
    } else {
      // Reset form when not editing
      setTaskName("")
      setOwner("")
      setSize("")
      setStartDate(new Date())
      setDueDate(undefined)
      setDependencies([])
      setTaskCost(undefined)
      setResourceId("")
    }
  }, [editingTask])

  // Update cost when size changes
  useEffect(() => {
    if (size) {
      setTaskCost(costMap[size as keyof typeof costMap])
    }
  }, [size])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!taskName) {
      setError("Task name is required")
      return
    }

    if (!size) {
      setError("T-shirt size is required")
      return
    }

    if (!startDate) {
      setError("Start date is required")
      return
    }

    // Check for circular dependencies
    if (editingTask && dependencies.includes(editingTask.id)) {
      setError("A task cannot depend on itself")
      return
    }

    // Calculate hours based on size
    const hours = sizeMap[size as keyof typeof sizeMap] || 0

    // Calculate cost based on size
    const cost = taskCost !== undefined ? taskCost : costMap[size as keyof typeof costMap] || 0

    const newTask: Task = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      name: taskName,
      owner: owner || "Unassigned",
      size: size as "XS" | "S" | "M" | "L" | "XL",
      startDate: startDate,
      dueDate: dueDate,
      cost: cost,
      hours: hours,
      dependencies: dependencies.length > 0 ? dependencies : undefined,
      resourceId: resourceId || undefined,
    }

    onAddTask(newTask)

    // Reset form if not editing
    if (!editingTask) {
      setTaskName("")
      setOwner("")
      setSize("")
      setStartDate(new Date())
      setDueDate(undefined)
      setError("")
      setDependencies([])
      setTaskCost(undefined)
      setResourceId("")
    }
  }

  // Format date for input
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "yyyy-MM-dd")
  }

  // Filter out the current task from available dependencies when editing
  const availableDependencyTasks = editingTask
    ? existingTasks.filter((task) => task.id !== editingTask.id)
    : existingTasks

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Task Name*</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Owner (Optional)</label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Enter owner name"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">T-shirt Size*</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
          >
            <option value="">Select size</option>
            <option value="XS">XS (4 hours - ${costMap.XS})</option>
            <option value="S">S (8 hours - ${costMap.S})</option>
            <option value="M">M (16 hours - ${costMap.M})</option>
            <option value="L">L (24 hours - ${costMap.L})</option>
            <option value="XL">XL (32 hours - ${costMap.XL})</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start Date*</label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date (Optional)</label>
          <input
            type="date"
            value={formatDateForInput(dueDate)}
            onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Assigned Resource</label>
        <select
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
        >
          <option value="">Select resource</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name} ({resource.capacity} hrs/week)
            </option>
          ))}
        </select>
      </div>

      {availableDependencyTasks.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Dependencies</label>
          <select
            multiple
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
            value={dependencies}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, (option) => option.value)
              setDependencies(values)
            }}
          >
            {availableDependencyTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name} ({task.size})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple tasks</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Cost (${taskCost || 0})</label>
        <input
          type="number"
          value={taskCost || ""}
          onChange={(e) => setTaskCost(Number(e.target.value))}
          placeholder="Custom cost (optional)"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">Default cost based on size will be used if left empty</p>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 active:bg-primary-800 transition-colors"
        >
          {editingTask ? "Update Task" : "Add Task"}
        </button>
        {editingTask && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
