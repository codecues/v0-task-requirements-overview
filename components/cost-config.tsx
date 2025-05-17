"use client"

import type React from "react"

import { useState } from "react"
import { costMap as defaultCostMap } from "@/lib/config"

interface CostConfigProps {
  onUpdateCosts: (costs: Record<string, number>) => void
}

export default function CostConfig({ onUpdateCosts }: CostConfigProps) {
  const [costs, setCosts] = useState({
    XS: defaultCostMap.XS,
    S: defaultCostMap.S,
    M: defaultCostMap.M,
    L: defaultCostMap.L,
    XL: defaultCostMap.XL,
  })

  const handleCostChange = (size: string, value: string) => {
    const numValue = Number.parseInt(value, 10) || 0
    setCosts({
      ...costs,
      [size]: numValue,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateCosts(costs)
  }

  return (
    <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Configure T-Shirt Size Costs</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(costs).map(([size, cost]) => (
            <div key={size}>
              <label className="block text-sm font-medium mb-1">{size} Size Cost ($)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => handleCostChange(size, e.target.value)}
                min="0"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 active:bg-primary-800 transition-colors w-full"
        >
          Save Cost Configuration
        </button>
      </form>
    </div>
  )
}
