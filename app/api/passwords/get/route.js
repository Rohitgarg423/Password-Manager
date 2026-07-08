import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/utils/db";
import User from "@/app/models/User";
import { decrypt } from "@/app/utils/encrypt";

export async function GET(request) {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
        return NextResponse.json({ message: "No token" }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // ✅ connect to MongoDB
        await connectDB()

        // ✅ find user by email from token
        const user = await User.findOne({ Email: decoded.email })
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // ✅ decrypt before sending to dashboard
        const decryptedPasswords = user.passwords 
        ? user.passwords.map(p => ({
            id: p.id,
            site: decrypt(p.site),
            username: decrypt(p.username),
            password: decrypt(p.password)
        })) 
        : [] 

        return NextResponse.json({ passwords: decryptedPasswords }, { status: 200 });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
}