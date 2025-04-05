import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AlertTriangle, FileText, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-10">
        <h1 className="text-4xl font-bold tracking-tight">Event Crisis Management Platform</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A comprehensive tool for event organizers to assess and manage potential crisis situations with real-time
          alerts and AI-powered risk assessment.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Submit Event
            </CardTitle>
            <CardDescription>Create a new event and get AI-powered crisis assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Fill out the event details form to receive an immediate risk assessment and recommended actions.
            </p>
            <Button asChild className="w-full">
              <Link href="/submit-event">Submit New Event</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Dashboard
            </CardTitle>
            <CardDescription>View your events and monitor real-time alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Access your dashboard to see all submitted events and their current status with real-time updates.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              Alerts
            </CardTitle>
            <CardDescription>Real-time crisis alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Receive instant notifications about critical situations and emergency updates for your events.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/alerts">View Alerts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

