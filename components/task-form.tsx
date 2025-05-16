"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
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
    if (size && !editingTask) {
      setTaskCost(costMap[size as keyof typeof costMap])
    }
  }, [size, editingTask])

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

    const newTask: Task = {
      id: editingTask ? editingTask.id : "",
      name: taskName,
      owner: owner || "Unassigned",
      size: size as "XS" | "S" | "M" | "L" | "XL",
      startDate: startDate,
      dueDate: dueDate,
      cost: taskCost || costMap[size as keyof typeof costMap] || 0,
      hours: sizeMap[size as keyof typeof sizeMap] || 0,
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

  const toggleDependency = (taskId: string) => {
    setDependencies((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  // Filter out the current task from available dependencies when editing
  const availableDependencyTasks = editingTask
    ? existingTasks.filter((task) => task.id !== editingTask.id)
    : existingTasks

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taskName">Task Name *</Label>
          <Input
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner">Owner (Optional)</Label>
          <Input id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Enter owner name" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">T-Shirt Size *</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger id="size">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="XS">XS (4 hours - ${costMap.XS})</SelectItem>
              <SelectItem value="S">S (8 hours - ${costMap.S})</SelectItem>
              <SelectItem value="M">M (16 hours - ${costMap.M})</SelectItem>
              <SelectItem value="L">L (24 hours - ${costMap.L})</SelectItem>
              <SelectItem value="XL">XL (32 hours - ${costMap.XL})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Due Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : "Auto-calculate"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resource">Assigned Resource</Label>
        <Select value={resourceId} onValueChange={setResourceId}>
          <SelectTrigger id="resource">
            <SelectValue placeholder="Select resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {resources.map((resource) => (
              <SelectItem key={resource.id} value={resource.id}>
                {resource.name} ({resource.capacity} hrs/week)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {availableDependencyTasks.length > 0 && (
        <div className="space-y-2">
          <Label>Dependencies (Optional)</Label>
          <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
            {availableDependencyTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`dependency-${task.id}`}
                  checked={dependencies.includes(task.id)}
                  onCheckedChange={() => toggleDependency(task.id)}
                />
                <Label htmlFor={`dependency-${task.id}`} className="cursor-pointer text-sm">
                  {task.name} ({task.size})
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cost">Cost (${taskCost || 0})</Label>
        <Input
          id="cost"
          type="number"
          value={taskCost || ""}
          onChange={(e) => setTaskCost(Number(e.target.value))}
          placeholder="Custom cost (optional)"
        />
        <p className="text-xs text-muted-foreground">Default cost based on size will be used if left empty</p>
      </div>

      <div className="flex justify-end space-x-2">
        {editingTask && (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
        <Button type="submit">{editingTask ? "Update Task" : "Add Task"}</Button>
      </div>
    </form>
  )
}
