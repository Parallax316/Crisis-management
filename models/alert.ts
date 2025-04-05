import mongoose, { Schema, type Document } from "mongoose"

export interface IAlert extends Document {
  eventId: mongoose.Types.ObjectId
  eventName: string
  message: string
  severity: string
  createdAt: Date
  isAutomatic: boolean
}

const AlertSchema: Schema = new Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  eventName: { type: String, required: true },
  message: { type: String, required: true },
  severity: {
    type: String,
    required: true,
    enum: ["low", "medium", "high", "critical"],
  },
  createdAt: { type: Date, default: Date.now },
  isAutomatic: { type: Boolean, default: false },
})

// Check if the model is already defined to prevent overwriting during hot reloads
export const Alert = mongoose.models.Alert || mongoose.model<IAlert>("Alert", AlertSchema)

