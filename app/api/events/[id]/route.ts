import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Event } from "@/models/event"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await Promise.resolve(params)

    // Connect to MongoDB
    await connectToDatabase()

    // Find event by ID
    const event = await Event.findById(id)

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      event,
    })
  } catch (error: any) {
    console.error(`Error fetching event ${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch event",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await Promise.resolve(params)
    const updates = await request.json()

    // Connect to MongoDB
    await connectToDatabase()

    // Find and update event
    const updatedEvent = await Event.findByIdAndUpdate(id, { $set: updates }, { new: true })

    if (!updatedEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    })
  } catch (error: any) {
    console.error(`Error updating event ${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update event",
      },
      { status: 500 },
    )
  }
}

