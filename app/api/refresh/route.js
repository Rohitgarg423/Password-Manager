import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request) {

    // get refresh token from cookie
    const refreshToken = request.cookies.get("refreshToken")?.value

    if (!refreshToken) {
        return NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }

    try {
        // verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

        // create new access token
        const accessToken = jwt.sign(
            { username: decoded.username, email: decoded.email },
            process.env.JWT_SECRET,
            { expiresIn: "1m" }
        )

        // ✅ generate new refresh token (rotation)
        const newRefreshToken = jwt.sign(
            { username: decoded.username, email: decoded.email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "2m" }
        )
        console.log("new refresh token generated")

        const response = NextResponse.json({ accessToken }, { status: 200 })

        response.cookies.set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 2 * 60
        })
        console.log("new refresh token set in cookie") 

        return response

    } catch (error) {
        return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 });
    }
}