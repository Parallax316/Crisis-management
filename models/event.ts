import mongoose, { Schema, type Document } from "mongoose"

export interface IEvent extends Document {
  eventName: string
  location: string
  crisisDescription: string
  urgencyLevel: string
  contactEmail: string
  contactPhone: string
  assessment: {
    riskLevel: string
    recommendedActions: string[]
    emergencyInstructions: string
    estimatedImpact: string
  }
  status: "active" | "completed"
  createdAt: Date
  updatedAt?: Date
}

const EventSchema: Schema = new Schema(
  {
    eventName: { type: String, required: true },
    location: { type: String, required: true },
    crisisDescription: { type: String, required: true },
    urgencyLevel: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
    },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    assessment: {
      riskLevel: {
        type: String,
        required: true,
        enum: ["low", "moderate", "high", "severe"],
      },
      recommendedActions: [{ type: String }],
      emergencyInstructions: { type: String },
      estimatedImpact: { type: String },
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "completed"],
      default: "active",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

// Check if the model is already defined to prevent overwriting during hot reloads
export const Event = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema)

