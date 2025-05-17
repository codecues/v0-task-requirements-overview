"use client"

import { format } from "date-fns"
import type { Task, Resource } from "@/lib/task-utils"
import { sizeMap } from "@/lib/config"

interface TaskListProps {
  tasks: Task[]
  onDeleteTask: (taskId: string) => void
  onEditTask: (taskId: string) => void
  resources: Resource[]
}

export default function TaskList({ tasks, onDeleteTask, onEditTask, resources }: TaskListProps) {
  if (tasks.length === 0) {
    return <div className="text-center py-4">No tasks added yet.</div>
  }

  // Function to get dependency names
  const getDependencyNames = (dependencyIds?: string[]) => {
    if (!dependencyIds || dependencyIds.length === 0) return "-"

    return dependencyIds.map((id) => tasks.find((task) => task.id === id)?.name || "Unknown").join(", ")
  }

  // Function to get resource name
  const getResourceName = (resourceId?: string) => {
    if (!resourceId) return "Unassigned"
    const resource = resources.find((r) => r.id === resourceId)
    return resource ? resource.name : "Unknown"
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left border-b">Task</th>
            <th className="p-3 text-left border-b">Owner</th>
            <th className="p-3 text-left border-b">Size</th>
            <th className="p-3 text-left border-b">Start Date</th>
            <th className="p-3 text-left border-b">ETA</th>
            <th className="p-3 text-left border-b">Dependencies</th>
            <th className="p-3 text-left border-b">Cost</th>
            <th className="p-3 text-left border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-3 border-b">{task.name}</td>
              <td className="p-3 border-b">{task.owner}</td>
              <td className="p-3 border-b">
                {task.size} ({sizeMap[task.size]}h)
              </td>
              <td className="p-3 border-b">{format(new Date(task.startDate), "yyyy-MM-dd")}</td>
              <td className="p-3 border-b">{task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "N/A"}</td>
              <td className="p-3 border-b">
                {task.dependencies && task.dependencies.length > 0 ? (
                  <div className="flex items-center">
                    <span className="mr-1">🔗</span>
                    <span>{getDependencyNames(task.dependencies)}</span>
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-3 border-b">${task.cost}</td>
              <td className="p-3 border-b">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditTask(task.id)}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
