import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectDB from "@/app/utils/db";
import User from "@/app/models/User";
import rateLimiter from "@/app/utils/rateLimiter"

export async function POST(request) {
    // ✅ get IP address
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    try {
        await rateLimiter.consume(ip)  // ✅ consume 1 point per attempt
    } catch (error) {
        // ✅ too many attempts
        return NextResponse.json(
            { message: "Too many login attempts. Try again in 15 minutes." },
            { status: 429 }
        )
    }
    
    const { user, pass } = await request.json();

    if (!user || !pass) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // ✅ connect to MongoDB
    await connectDB()

    // ✅ find user by username or email
    const User_data = await User.findOne({
        $or: [{ Username: user }, { Email: user }]
    })

    if (!User_data) {
        return NextResponse.json({ message: "Account doesn't exist" }, { status: 400 });
    }

    // ✅ compare password
    const isMatch = await bcrypt.compare(pass, User_data.Password)
    if (!isMatch) {
        return NextResponse.json({ message: "Incorrect Password" }, { status: 400 });
    }

    // ✅ create access token
    const accessToken = jwt.sign(
        { username: User_data.Username, email: User_data.Email },
        process.env.JWT_SECRET,
        { expiresIn: "1m" }
    )

    // ✅ create refresh token
    const refreshToken = jwt.sign(
        { username: User_data.Username, email: User_data.Email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "2m" }
    )

    const response = NextResponse.json({
        message: "Logged In Successfully!",
        accessToken
    }, { status: 200 })

    // ✅ store refresh token in HTTP-only cookie
    response.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 60
    })

    return response
}