import mongoose from "mongoose"

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        // already connected — don't connect again
        return
    }
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("MongoDB connected")
}

export default connectDB