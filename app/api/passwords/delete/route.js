import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/utils/db";
import User from "@/app/models/User";

export async function DELETE(request) {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
        return NextResponse.json({ message: "No token" }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const { id } = await request.json()

        await connectDB()

        const user = await User.findOne({ Email: decoded.email })
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // ✅ filter out the password with matching id
        user.passwords = user.passwords.filter(p => p.id !== id)

        await user.save()

        return NextResponse.json({ message: "Password deleted!" }, { status: 200 });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
}