import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Event } from "@/models/event"
import { Alert } from "@/models/alert"

export async function GET() {
  try {
    // Connect to MongoDB
    await connectToDatabase()

    // Get event statistics
    const totalEvents = await Event.countDocuments()
    const activeEvents = await Event.countDocuments({ status: "active" })
    const completedEvents = await Event.countDocuments({ status: "completed" })

    // Get risk level distribution
    const riskLevelStats = await Event.aggregate([
      {
        $group: {
          _id: "$assessment.riskLevel",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          riskLevel: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ])

    // Get alert statistics
    const totalAlerts = await Alert.countDocuments()
    const alertsBySeverity = await Alert.aggregate([
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          severity: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ])

    // Get events over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const eventsOverTime = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { date: 1 },
      },
    ])

    // Get alerts over time (last 30 days)
    const alertsOverTime = await Alert.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { date: 1 },
      },
    ])

    return NextResponse.json({
      success: true,
      analytics: {
        events: {
          total: totalEvents,
          active: activeEvents,
          completed: completedEvents,
          byRiskLevel: riskLevelStats,
        },
        alerts: {
          total: totalAlerts,
          bySeverity: alertsBySeverity,
        },
        trends: {
          eventsOverTime,
          alertsOverTime,
        },
      },
    })
  } catch (error: any) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch analytics",
      },
      { status: 500 },
    )
  }
}

