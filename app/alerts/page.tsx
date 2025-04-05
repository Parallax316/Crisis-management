"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, Bell, BellOff, RefreshCw } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useWebSocket } from "@/hooks/use-websocket"
import { AlertNotification } from "@/components/alert-notification"

// Mock data for alerts
const mockAlerts = [
  {
    id: "alert_123",
    eventId: "evt_123456",
    eventName: "Tech Conference 2023",
    message: "Weather alert: Thunderstorm warning in effect for the area.",
    severity: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
  },
  {
    id: "alert_456",
    eventId: "evt_789012",
    eventName: "Music Festival",
    message: "Security alert: Unauthorized access detected at south entrance.",
    severity: "critical",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: "alert_789",
    eventId: "evt_345678",
    eventName: "Corporate Retreat",
    message: "Medical alert: Attendee reported with symptoms requiring first aid.",
    severity: "medium",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [isLoading, setIsLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const { toast } = useToast()
  const { lastMessage, connectionStatus } = useWebSocket()

  useEffect(() => {
    if (lastMessage && notificationsEnabled) {
      // Add the new alert to the list
      setAlerts((prev) => [
        {
          id: `alert_${Date.now()}`,
          eventId: lastMessage.eventId || "unknown",
          eventName: lastMessage.eventName || "Unknown Event",
          message: lastMessage.message,
          severity: lastMessage.severity || "medium",
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ])

      toast({
        title: "New Alert Received",
        description: `${lastMessage.eventName}: ${lastMessage.message}`,
        variant: "destructive",
      })
    }
  }, [lastMessage, notificationsEnabled, toast])

  const refreshData = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Alerts Refreshed",
        description: "Latest alert data has been loaded.",
      })
    }, 1000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    let interval = seconds / 31536000 // years
    if (interval > 1) return `${Math.floor(interval)} years ago`

    interval = seconds / 2592000 // months
    if (interval > 1) return `${Math.floor(interval)} months ago`

    interval = seconds / 86400 // days
    if (interval > 1) return `${Math.floor(interval)} days ago`

    interval = seconds / 3600 // hours
    if (interval > 1) return `${Math.floor(interval)} hours ago`

    interval = seconds / 60 // minutes
    if (interval > 1) return `${Math.floor(interval)} minutes ago`

    return `${Math.floor(seconds)} seconds ago`
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Critical
          </Badge>
        )
      case "high":
        return (
          <Badge variant="destructive" className="text-xs bg-orange-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
            Low
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Unknown
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground mt-1">Real-time crisis alerts and notifications</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            <Label htmlFor="notifications" className="text-sm flex items-center">
              {notificationsEnabled ? (
                <>
                  <Bell className="mr-1 h-3 w-3" /> Notifications On
                </>
              ) : (
                <>
                  <BellOff className="mr-1 h-3 w-3" /> Notifications Off
                </>
              )}
            </Label>
          </div>
          <div className="text-sm">
            WebSocket:
            <Badge
              variant={connectionStatus === "connected" ? "outline" : "destructive"}
              className={`ml-2 ${connectionStatus === "connected" ? "bg-green-100 text-green-800 border-green-300" : ""}`}
            >
              {connectionStatus}
            </Badge>
          </div>
          <Button onClick={refreshData} disabled={isLoading} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {lastMessage && notificationsEnabled && <AlertNotification alert={lastMessage} />}

      <div className="grid gap-6">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <Card key={alert.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{alert.eventName}</CardTitle>
                    <CardDescription className="text-sm">
                      {getTimeSince(alert.timestamp)} • {formatDate(alert.timestamp)}
                    </CardDescription>
                  </div>
                  <div>{getSeverityBadge(alert.severity)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{alert.message}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Alert ID: {alert.id} • Event ID: {alert.eventId}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No alerts to display.</p>
              <p className="text-muted-foreground text-center text-sm mt-1">
                New alerts will appear here when they are received.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

