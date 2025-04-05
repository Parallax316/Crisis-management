import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Event } from "@/models/event"
import { processWithAI } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const eventData = await request.json()

    // Connect to MongoDB
    await connectToDatabase()

    // Process the event data with AI for risk assessment
    const aiAssessment = await processWithAI(eventData)

    // Create a new event with the AI assessment
    const newEvent = new Event({
      ...eventData,
      assessment: aiAssessment,
      createdAt: new Date(),
      status: "active",
    })

    // Save to database
    await newEvent.save()

    return NextResponse.json(
      {
        success: true,
        event: newEvent,
        assessment: aiAssessment,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error submitting event:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit event",
      },
      { status: 500 },
    )
  }
}

