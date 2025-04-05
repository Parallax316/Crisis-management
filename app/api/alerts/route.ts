import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Alert } from "@/models/alert"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    // Connect to MongoDB
    await connectToDatabase()

    // Build query
    const query: any = {}
    if (eventId) {
      query.eventId = eventId
    }

    // Fetch alerts
    const alerts = await Alert.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    // Get total count for pagination
    const total = await Alert.countDocuments(query)

    return NextResponse.json({
      success: true,
      alerts,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + alerts.length < total,
      },
    })
  } catch (error: any) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch alerts",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const alertData = await request.json()

    // Connect to MongoDB
    await connectToDatabase()

    // Create a new alert
    const newAlert = new Alert({
      ...alertData,
      createdAt: new Date(),
    })

    // Save to database
    await newAlert.save()

    return NextResponse.json(
      {
        success: true,
        alert: newAlert,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating alert:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create alert",
      },
      { status: 500 },
    )
  }
}

