import { Event } from "@/models/event"
import { Alert } from "@/models/alert"

interface EventData {
  eventName: string
  location: string
  crisisDescription: string
  urgencyLevel: string
  contactEmail: string
  contactPhone: string
}

interface AIAssessment {
  riskLevel: string
  recommendedActions: string[]
  emergencyInstructions: string
  estimatedImpact: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function processWithAI(eventData: EventData): Promise<AIAssessment> {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

    if (!OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is not configured")
    }

    const prompt = `
      You are an AI crisis management assistant for event organizers.
      
      Analyze the following event details and provide a risk assessment:
      
      Event Name: ${eventData.eventName}
      Location: ${eventData.location}
      Crisis Description: ${eventData.crisisDescription}
      Urgency Level: ${eventData.urgencyLevel}
      
      Provide your assessment in the following JSON format:
      {
        "riskLevel": "low|moderate|high|severe",
        "recommendedActions": ["action1", "action2", "action3", "action4"],
        "emergencyInstructions": "Detailed instructions for handling this crisis",
        "estimatedImpact": "Description of potential impact"
      }
      
      Only respond with the JSON object, no additional text.
    `

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "Crisis Management System",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Clean the response by removing markdown code blocks and whitespace
    const cleanedContent = content
      .replace(/```json\n?/g, '')  // Remove ```json
      .replace(/```\n?/g, '')      // Remove ```
      .trim()                      // Remove leading/trailing whitespace

    // Parse the JSON response
    try {
      const assessment = JSON.parse(cleanedContent)

      // Create an alert if risk level is high or severe
      if (assessment.riskLevel === "high" || assessment.riskLevel === "severe") {
        await createAutomaticAlert(eventData, assessment)
      }

      return assessment
    } catch (error) {
      console.error("Error parsing AI response:", error)
      console.error("Raw content:", content)
      throw new Error("Failed to parse AI assessment response")
    }
  } catch (error) {
    console.error("Error processing with AI:", error)
    // Fallback assessment if API call fails
    return {
      riskLevel:
        eventData.urgencyLevel === "critical"
          ? "severe"
          : eventData.urgencyLevel === "high"
            ? "high"
            : eventData.urgencyLevel === "medium"
              ? "moderate"
              : "low",
      recommendedActions: [
        "Establish a command center",
        "Alert emergency services",
        "Prepare evacuation routes",
        "Set up communication channels",
      ],
      emergencyInstructions:
        "Maintain calm and follow established protocols. Ensure all staff are briefed on their responsibilities.",
      estimatedImpact: "AI processing failed. Please review the crisis description manually.",
    }
  }
}

export async function processAIChatMessage(
  message: string,
  eventId?: string,
  history: ChatMessage[] = [],
): Promise<string> {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

    if (!OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is not configured")
    }

    // If eventId is provided, get event details to provide context
    let eventContext = ""
    if (eventId) {
      try {
        const event = await Event.findById(eventId)
        if (event) {
          eventContext = `
            You are discussing the following event:
            Event Name: ${event.eventName}
            Location: ${event.location}
            Crisis Description: ${event.crisisDescription}
            Risk Level: ${event.assessment.riskLevel}
            
            The recommended actions for this event are:
            ${event.assessment.recommendedActions.join("\n")}
            
            Emergency Instructions: ${event.assessment.emergencyInstructions}
          `
        }
      } catch (error) {
        console.error("Error fetching event for chat context:", error)
      }
    }

    const systemPrompt = `
      You are an AI crisis management assistant for event organizers.
      Your role is to provide clear, concise, and helpful guidance for managing crisis situations at events.
      Be direct, professional, and focus on safety and effective crisis management.
      ${eventContext}
    `

    // Prepare messages array with system prompt and history
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...history,
      {
        role: "user",
        content: message,
      },
    ]

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "Crisis Management System",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error processing chat message with AI:", error)
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later."
  }
}

async function createAutomaticAlert(eventData: EventData, assessment: AIAssessment) {
  try {
    // Find the event ID (assuming it's been created already)
    const event = await Event.findOne({ eventName: eventData.eventName }).sort({ createdAt: -1 })

    if (!event) {
      console.error("Could not find event to create automatic alert")
      return
    }

    // Create an alert
    const newAlert = new Alert({
      eventId: event._id,
      eventName: eventData.eventName,
      message: `Automatic alert: ${assessment.riskLevel.toUpperCase()} risk level detected. ${assessment.estimatedImpact}`,
      severity: assessment.riskLevel === "severe" ? "critical" : assessment.riskLevel,
      createdAt: new Date(),
      isAutomatic: true,
    })

    await newAlert.save()
    console.log(`Automatic alert created for event: ${eventData.eventName}`)
  } catch (error) {
    console.error("Error creating automatic alert:", error)
  }
}

