import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/app/utils/db";
import User from "@/app/models/User";
import rateLimiter from "@/app/utils/rateLimiter"

export async function POST(request) {
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    try {
        await rateLimiter.consume(ip)
    } catch (error) {
        return NextResponse.json(
            { message: "Too many attempts. Try again in 15 minutes." },
            { status: 429 }
        )
    }
    
    const { username, email, pass, confirmPass } = await request.json();

    if (!username || !email || !pass || !confirmPass) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    if (pass !== confirmPass) {
        return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }

    // ✅ connect to MongoDB
    await connectDB()

    // ✅ check if email already exists
    const existingEmail = await User.findOne({ Email: email })
    if (existingEmail) {
        return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    // ✅ check if username already exists
    const existingUsername = await User.findOne({ Username: username })
    if (existingUsername) {
        return NextResponse.json({ message: "Username already taken" }, { status: 400 });
    }

    // ✅ hash password
    const hashPass = await bcrypt.hash(pass, 10)

    // ✅ create and save user to MongoDB
    const user = new User({
        Username: username,
        Email: email,
        Password: hashPass
    })
    await user.save()

    return NextResponse.json({ message: "Account Created Successfully!" }, { status: 200 });
}