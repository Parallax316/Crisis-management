import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  try {
    if (cached.conn) {
      return cached.conn
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      }

      console.log("Attempting to connect to MongoDB...")
      cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
        console.log("Successfully connected to MongoDB")
        return mongoose
      }).catch((error) => {
        console.error("MongoDB connection error:", error)
        throw error
      })
    }

    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    console.error("Error in connectToDatabase:", error)
    throw error
  }
}

