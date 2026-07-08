import mongoose from "mongoose"

const passwordSchema = new mongoose.Schema({
    id: String,
    site: String,
    username: String,
    password: String
})

const userSchema = new mongoose.Schema({
    Username: { type: String, unique: true },
    Email: { type: String, unique: true },
    Password: String,
    createdAt: { type: Date, default: Date.now },
    passwords: [passwordSchema]
})

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User