"use client"

import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Link } from "lucide-react"
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
    if (!dependencyIds || dependencyIds.length === 0) return "None"

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Dependencies</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.name}</TableCell>
              <TableCell>{task.owner}</TableCell>
              <TableCell>{getResourceName(task.resourceId)}</TableCell>
              <TableCell>{task.size}</TableCell>
              <TableCell>{sizeMap[task.size]} hrs</TableCell>
              <TableCell>${task.cost}</TableCell>
              <TableCell>{format(new Date(task.startDate), "MMM d, yyyy")}</TableCell>
              <TableCell>{task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "N/A"}</TableCell>
              <TableCell>
                {task.dependencies && task.dependencies.length > 0 ? (
                  <div className="flex items-center">
                    <Link className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="text-sm">{getDependencyNames(task.dependencies)}</span>
                  </div>
                ) : (
                  "None"
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onEditTask(task.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
