import { NextResponse } from "next/server";

export async function GET() {
    const response = NextResponse.json({ message: "Logged out" }, { status: 200 })
    
    // ✅ clear the refresh token cookie
    response.cookies.set("refreshToken", "", {
        httpOnly: true,
        maxAge: 0  // expires immediately
    })

    return response
}