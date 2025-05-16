"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit } from "lucide-react"
import type { Resource } from "@/lib/task-utils"

interface ResourceManagerProps {
  resources: Resource[]
  onAddResource: (resource: Resource) => void
  onUpdateResource: (resource: Resource) => void
  onDeleteResource: (resourceId: string) => void
}

export default function ResourceManager({
  resources,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
}: ResourceManagerProps) {
  const [name, setName] = useState("")
  const [capacity, setCapacity] = useState(40)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      setError("Resource name is required")
      return
    }

    if (capacity <= 0) {
      setError("Capacity must be greater than 0")
      return
    }

    if (editingResource) {
      // Update existing resource
      onUpdateResource({
        ...editingResource,
        name,
        capacity,
      })
      setEditingResource(null)
    } else {
      // Add new resource
      onAddResource({
        id: "",
        name,
        capacity,
      })
    }

    // Reset form
    setName("")
    setCapacity(40)
    setError("")
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setName(resource.name)
    setCapacity(resource.capacity)
  }

  const handleCancel = () => {
    setEditingResource(null)
    setName("")
    setCapacity(40)
    setError("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingResource ? "Edit Resource" : "Add Resource"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Resource Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter resource name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (hours/week)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  min="1"
                  max="168"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              {editingResource && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit">{editingResource ? "Update Resource" : "Add Resource"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource List</CardTitle>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <div className="text-center py-4">No resources added yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Capacity (hours/week)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    <TableCell>{resource.capacity} hrs</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(resource)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteResource(resource.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
