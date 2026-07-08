import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import connectDB from "@/app/utils/db";
import User from "@/app/models/User";
import { encrypt } from "@/app/utils/encrypt";

export async function POST(request) {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
        return NextResponse.json({ message: "No token" }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const { site, username, password } = await request.json()

        if (site.length < 3 || username.length < 3 || password.length < 3) {
            return NextResponse.json({ message: "Fields too short" }, { status: 400 });
        }

        await connectDB()

        const user = await User.findOne({ Email: decoded.email })
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.passwords.push({
            id: uuidv4(),
            site: encrypt(site),
            username: encrypt(username),
            password: encrypt(password)
        })

        await user.save()

        return NextResponse.json({ message: "Password saved!" }, { status: 200 });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
}