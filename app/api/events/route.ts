import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Event } from "@/models/event"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    // Connect to MongoDB
    await connectToDatabase()

    // Build query
    const query: any = {}
    if (status) {
      query.status = status
    }

    // Fetch events
    const events = await Event.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    // Get total count for pagination
    const total = await Event.countDocuments(query)

    return NextResponse.json({
      success: true,
      events,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + events.length < total,
      },
    })
  } catch (error: any) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch events",
      },
      { status: 500 },
    )
  }
}

