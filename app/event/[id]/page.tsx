"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, CheckCircle, Clock, ArrowLeft, MessageSquare, Send, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useWebSocket } from "@/hooks/use-websocket"
import { AlertNotification } from "@/components/alert-notification"

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAlertsLoading, setIsAlertsLoading] = useState(true)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const { toast } = useToast()
  const { lastMessage, connectionStatus } = useWebSocket()

  useEffect(() => {
    fetchEventDetails()
    fetchAlerts()

    // Set up auto-refresh interval if enabled
    let intervalId: NodeJS.Timeout | null = null
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchAlerts()
      }, 30000) // Refresh every 30 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [eventId, autoRefresh])

  useEffect(() => {
    if (lastMessage && lastMessage.eventId === eventId) {
      // Add the new alert to our list
      setAlerts((prev) => [lastMessage, ...prev])

      toast({
        title: "New Alert Received",
        description: lastMessage.message,
        variant: "destructive",
      })
    }
  }, [lastMessage, eventId, toast])

  const fetchEventDetails = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch event details")
      }

      const data = await response.json()
      if (data.success) {
        setEvent(data.event)
      } else {
        throw new Error(data.error || "Failed to fetch event details")
      }
    } catch (error: any) {
      console.error("Error fetching event details:", error)
      toast({
        title: "Error fetching event details",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAlerts = async () => {
    setIsAlertsLoading(true)
    try {
      const response = await fetch(`/api/alerts?eventId=${eventId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch alerts")
      }

      const data = await response.json()
      if (data.success) {
        setAlerts(data.alerts)
      } else {
        throw new Error(data.error || "Failed to fetch alerts")
      }
    } catch (error: any) {
      console.error("Error fetching alerts:", error)
      toast({
        title: "Error fetching alerts",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsAlertsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSendingMessage(true)
    try {
      // Add user message to chat
      const userMessage = {
        role: "user",
        content: newMessage,
        timestamp: new Date().toISOString(),
      }

      setChatMessages((prev) => [...prev, userMessage])

      // Prepare history for context
      const history = chatMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Send to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage,
          eventId,
          history,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      if (data.success) {
        // Add AI response to chat
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            timestamp: new Date().toISOString(),
          },
        ])
      } else {
        throw new Error(data.error || "Failed to process message")
      }

      // Clear input
      setNewMessage("")
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSendingMessage(false)
    }
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

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "severe":
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Severe Risk
          </Badge>
        )
      case "high":
        return (
          <Badge variant="destructive" className="text-xs bg-orange-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            High Risk
          </Badge>
        )
      case "moderate":
        return (
          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="mr-1 h-3 w-3" />
            Moderate Risk
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Low Risk
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Unknown Risk
          </Badge>
        )
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">Event not found.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{event.eventName}</h1>
            {getRiskBadge(event.assessment.riskLevel)}
          </div>
          <p className="text-muted-foreground mt-1">
            {event.location} • Created on {formatDate(event.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={event.status === "active" ? "outline" : "secondary"}>
            {event.status === "active" ? "Active" : "Completed"}
          </Badge>
          <div className="text-sm">
            WebSocket:
            <Badge
              variant={connectionStatus === "connected" ? "outline" : "destructive"}
              className={`ml-2 ${connectionStatus === "connected" ? "bg-green-100 text-green-800 border-green-300" : ""}`}
            >
              {connectionStatus}
            </Badge>
          </div>
        </div>
      </div>

      {lastMessage && lastMessage.eventId === eventId && <AlertNotification alert={lastMessage} />}

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {alerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="chat">
            AI Assistant
            <MessageSquare className="ml-2 h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Description</h3>
                  <p className="mt-1 text-sm">{event.crisisDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Urgency Level</h3>
                    <p className="mt-1 text-sm capitalize">{event.urgencyLevel}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Status</h3>
                    <p className="mt-1 text-sm capitalize">{event.status}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Contact Email</h3>
                    <p className="mt-1 text-sm">{event.contactEmail}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Contact Phone</h3>
                    <p className="mt-1 text-sm">{event.contactPhone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>AI-generated assessment for this event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Risk Level</h3>
                  <div className="mt-1">{getRiskBadge(event.assessment.riskLevel)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Estimated Impact</h3>
                  <p className="mt-1 text-sm">{event.assessment.estimatedImpact}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Recommended Actions</h3>
                  <ul className="mt-1 list-disc pl-5 space-y-1">
                    {event.assessment.recommendedActions.map((action: string, index: number) => (
                      <li key={index} className="text-sm">
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md bg-primary/10 p-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-primary" />
                    Emergency Instructions
                  </h3>
                  <p className="mt-1 text-sm">{event.assessment.emergencyInstructions}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={event.status === "active" ? "destructive" : "default"}
                  className="w-full"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/events/${eventId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          status: event.status === "active" ? "completed" : "active",
                        }),
                      })

                      if (!response.ok) {
                        throw new Error("Failed to update event status")
                      }

                      const data = await response.json()
                      if (data.success) {
                        setEvent(data.event)
                        toast({
                          title: "Event status updated",
                          description: `Event marked as ${data.event.status}`,
                        })
                      } else {
                        throw new Error(data.error || "Failed to update event status")
                      }
                    } catch (error: any) {
                      toast({
                        title: "Error updating event",
                        description: error.message,
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  {event.status === "active" ? "Mark as Completed" : "Reactivate Event"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Event Alerts</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                <Label htmlFor="auto-refresh" className="text-sm">
                  Auto-refresh
                </Label>
              </div>
              <Button onClick={fetchAlerts} disabled={isAlertsLoading} size="sm" variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${isAlertsLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {isAlertsLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert._id} className={alert.isAutomatic ? "border-l-4 border-l-destructive" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {alert.isAutomatic && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-destructive/10 text-destructive border-destructive/20"
                            >
                              Automatic
                            </Badge>
                          )}
                          Alert
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {getTimeSince(alert.createdAt)} • {formatDate(alert.createdAt)}
                        </CardDescription>
                      </div>
                      <div>{getSeverityBadge(alert.severity)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{alert.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground text-center">No alerts for this event yet.</p>
                <p className="text-muted-foreground text-center text-sm mt-1">
                  Alerts will appear here when they are received.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Crisis Management Assistant</CardTitle>
              <CardDescription>Ask questions about this event or get guidance on crisis management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto border rounded-md p-4 mb-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No messages yet. Start a conversation with the AI assistant.
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      You can ask about crisis management strategies, event details, or next steps.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">{formatDate(message.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button onClick={handleSendMessage} disabled={isSendingMessage || !newMessage.trim()}>
                  {isSendingMessage ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

