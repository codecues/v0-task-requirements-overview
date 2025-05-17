"use client"

import type React from "react"

import { useState } from "react"
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
        id: `resource-${Date.now()}`,
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
      <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{editingResource ? "Edit Resource" : "Add Resource"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Resource Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter resource name"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Capacity (hours/week)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min="1"
                max="168"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 active:bg-primary-800 transition-colors"
            >
              {editingResource ? "Update Resource" : "Add Resource"}
            </button>
            {editingResource && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Resource List</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left border-b">Name</th>
                <th className="p-3 text-left border-b">Capacity (hours/week)</th>
                <th className="p-3 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-3 text-center">
                    No resources added yet.
                  </td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 border-b font-medium">{resource.name}</td>
                    <td className="p-3 border-b">{resource.capacity} hrs</td>
                    <td className="p-3 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(resource)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDeleteResource(resource.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
