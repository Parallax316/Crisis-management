"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, CheckCircle, Clock, Eye, RefreshCw, BarChart, Loader2 } from "lucide-react"
import Link from "next/link"
import { useWebSocket } from "@/hooks/use-websocket"
import { AlertNotification } from "@/components/alert-notification"
import AnalyticsDashboard from "@/components/analytics-dashboard"

export default function DashboardPage() {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const { toast } = useToast()
  const { lastMessage, connectionStatus } = useWebSocket()

  useEffect(() => {
    fetchEvents()
  }, [activeTab])

  useEffect(() => {
    if (lastMessage) {
      toast({
        title: "New Alert Received",
        description: `Alert for ${lastMessage.eventName}: ${lastMessage.message}`,
        variant: "destructive",
      })

      // Refresh events if we're on the active tab to show latest data
      if (activeTab === "active") {
        fetchEvents()
      }
    }
  }, [lastMessage, toast, activeTab])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const status = activeTab !== "all" ? activeTab : undefined
      const response = await fetch(`/api/events${status ? `?status=${status}` : ""}`)

      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }

      const data = await response.json()
      if (data.success) {
        setEvents(data.events)
      } else {
        throw new Error(data.error || "Failed to fetch events")
      }
    } catch (error: any) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error fetching events",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = () => {
    fetchEvents()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "severe":
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Severe
          </Badge>
        )
      case "high":
        return (
          <Badge variant="destructive" className="text-xs bg-orange-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            High
          </Badge>
        )
      case "moderate":
        return (
          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="mr-1 h-3 w-3" />
            Moderate
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="mr-1 h-3 w-3" />
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor your events and crisis assessments</p>
        </div>
        <div className="flex items-center gap-4">
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

      {lastMessage && <AlertNotification alert={lastMessage} />}

      <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="active">Active Events</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : events.length > 0 ? (
            <div className="grid gap-6">
              {events.map((event: any) => (
                <EventCard
                  key={event._id}
                  event={{
                    id: event._id,
                    eventName: event.eventName,
                    location: event.location,
                    riskLevel: event.assessment.riskLevel,
                    timestamp: event.createdAt,
                    status: event.status,
                  }}
                  formatDate={formatDate}
                  getRiskBadge={getRiskBadge}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground text-center">No active events found.</p>
                <Button asChild className="mt-4">
                  <Link href="/submit-event">Submit New Event</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : events.length > 0 ? (
            <div className="grid gap-6">
              {events.map((event: any) => (
                <EventCard
                  key={event._id}
                  event={{
                    id: event._id,
                    eventName: event.eventName,
                    location: event.location,
                    riskLevel: event.assessment.riskLevel,
                    timestamp: event.createdAt,
                    status: event.status,
                  }}
                  formatDate={formatDate}
                  getRiskBadge={getRiskBadge}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground text-center">No completed events found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : events.length > 0 ? (
            <div className="grid gap-6">
              {events.map((event: any) => (
                <EventCard
                  key={event._id}
                  event={{
                    id: event._id,
                    eventName: event.eventName,
                    location: event.location,
                    riskLevel: event.assessment.riskLevel,
                    timestamp: event.createdAt,
                    status: event.status,
                  }}
                  formatDate={formatDate}
                  getRiskBadge={getRiskBadge}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground text-center">No events found.</p>
                <Button asChild className="mt-4">
                  <Link href="/submit-event">Submit New Event</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EventCard({
  event,
  formatDate,
  getRiskBadge,
}: {
  event: any
  formatDate: (date: string) => string
  getRiskBadge: (risk: string) => JSX.Element
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <CardTitle>{event.eventName}</CardTitle>
            <CardDescription className="text-sm">
              {event.location} • {formatDate(event.timestamp)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getRiskBadge(event.riskLevel)}
            <Badge variant={event.status === "active" ? "outline" : "secondary"} className="text-xs">
              {event.status === "active" ? "Active" : "Completed"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">ID: {event.id}</div>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/event/${event.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

