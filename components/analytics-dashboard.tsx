"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle, BarChart3 } from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Bar, Pie } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analytics")

      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const data = await response.json()
      if (data.success) {
        setAnalytics(data.analytics)
      } else {
        throw new Error(data.error || "Failed to fetch analytics")
      }
    } catch (error: any) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error fetching analytics",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">Failed to load analytics data.</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for risk level distribution chart
  const riskLevelData = {
    labels: analytics.events.byRiskLevel.map(
      (item: any) => item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1),
    ),
    datasets: [
      {
        label: "Events by Risk Level",
        data: analytics.events.byRiskLevel.map((item: any) => item.count),
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)", // low
          "rgba(255, 206, 86, 0.6)", // moderate
          "rgba(255, 159, 64, 0.6)", // high
          "rgba(255, 99, 132, 0.6)", // severe
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  // Prepare data for alerts by severity chart
  const alertSeverityData = {
    labels: analytics.alerts.bySeverity.map(
      (item: any) => item.severity.charAt(0).toUpperCase() + item.severity.slice(1),
    ),
    datasets: [
      {
        label: "Alerts by Severity",
        data: analytics.alerts.bySeverity.map((item: any) => item.count),
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)", // low
          "rgba(255, 206, 86, 0.6)", // medium
          "rgba(255, 159, 64, 0.6)", // high
          "rgba(255, 99, 132, 0.6)", // critical
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  // Prepare data for events over time chart
  const eventsOverTimeData = {
    labels: analytics.trends.eventsOverTime.map((item: any) =>
      new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ),
    datasets: [
      {
        label: "Events",
        data: analytics.trends.eventsOverTime.map((item: any) => item.count),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Prepare data for alerts over time chart
  const alertsOverTimeData = {
    labels: analytics.trends.alertsOverTime.map((item: any) =>
      new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ),
    datasets: [
      {
        label: "Alerts",
        data: analytics.trends.alertsOverTime.map((item: any) => item.count),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.events.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.events.active} active, {analytics.events.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.alerts.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.events.byRiskLevel.find((item: any) => item.riskLevel === "high")?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Events with high risk level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Severe Risk Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.events.byRiskLevel.find((item: any) => item.riskLevel === "severe")?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Events with severe risk level</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Events by Risk Level</CardTitle>
                <CardDescription>Distribution of events across different risk levels</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <Pie data={riskLevelData} options={pieOptions} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alerts by Severity</CardTitle>
                <CardDescription>Distribution of alerts across different severity levels</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <Pie data={alertSeverityData} options={pieOptions} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Events Over Time</CardTitle>
                <CardDescription>Number of events submitted over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <Line data={eventsOverTimeData} options={lineOptions} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alerts Over Time</CardTitle>
                <CardDescription>Number of alerts generated over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <Line data={alertsOverTimeData} options={lineOptions} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Events vs Alerts</CardTitle>
              <CardDescription>Comparison between events and alerts by risk level</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-80">
                <Bar
                  data={{
                    labels: ["Low", "Medium/Moderate", "High", "Critical/Severe"],
                    datasets: [
                      {
                        label: "Events",
                        data: [
                          analytics.events.byRiskLevel.find((item: any) => item.riskLevel === "low")?.count || 0,
                          analytics.events.byRiskLevel.find((item: any) => item.riskLevel === "moderate")?.count || 0,
                          analytics.events.byRiskLevel.find((item: any) => item.riskLevel === "high")?.count || 0,
                          analytics.events.byRiskLevel.find((item: any) => item.riskLevel === "severe")?.count || 0,
                        ],
                        backgroundColor: "rgba(54, 162, 235, 0.6)",
                      },
                      {
                        label: "Alerts",
                        data: [
                          analytics.alerts.bySeverity.find((item: any) => item.severity === "low")?.count || 0,
                          analytics.alerts.bySeverity.find((item: any) => item.severity === "medium")?.count || 0,
                          analytics.alerts.bySeverity.find((item: any) => item.severity === "high")?.count || 0,
                          analytics.alerts.bySeverity.find((item: any) => item.severity === "critical")?.count || 0,
                        ],
                        backgroundColor: "rgba(255, 99, 132, 0.6)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

