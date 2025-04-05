import { NextResponse } from "next/server"
import { processAIChatMessage } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const { message, eventId, history } = await request.json()

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
        },
        { status: 400 },
      )
    }

    // Process the message with AI
    const response = await processAIChatMessage(message, eventId, history)

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error: any) {
    console.error("Error processing chat message:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process message",
      },
      { status: 500 },
    )
  }
}

