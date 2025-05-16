"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
    <Card>
      <CardHeader>
        <CardTitle>Configure T-Shirt Size Costs</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(costs).map(([size, cost]) => (
              <div key={size} className="space-y-2">
                <Label htmlFor={`cost-${size}`}>{size} Size Cost ($)</Label>
                <Input
                  id={`cost-${size}`}
                  type="number"
                  value={cost}
                  onChange={(e) => handleCostChange(size, e.target.value)}
                  min="0"
                />
              </div>
            ))}
          </div>
          <Button type="submit" className="w-full">
            Save Cost Configuration
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
