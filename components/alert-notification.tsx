"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface AlertNotificationProps {
  alert: {
    eventName?: string
    message: string
    severity?: string
    timestamp?: string
  }
}

export function AlertNotification({ alert }: AlertNotificationProps) {
  const [visible, setVisible] = useState(true)

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-red-500" // Default to critical for alerts
    }
  }

  return (
    <Card className="relative border-l-4 border-red-500 animate-slideIn">
      <div className={`absolute left-0 top-0 w-full h-1 ${getSeverityColor(alert.severity)}`} />
      <CardContent className="p-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              New Alert
              {alert.severity && (
                <Badge variant="outline" className="text-xs">
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                </Badge>
              )}
            </div>
            {alert.eventName && <div className="text-sm font-medium mt-1">{alert.eventName}</div>}
            <p className="text-sm mt-1">{alert.message}</p>
            {alert.timestamp && (
              <div className="text-xs text-muted-foreground mt-1">{new Date(alert.timestamp).toLocaleTimeString()}</div>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full" onClick={() => setVisible(false)}>
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </CardContent>
    </Card>
  )
}

