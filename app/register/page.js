"use client"
import React, { useState } from "react";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
    const [confirmPass, setConfirmPass] = useState("")
    const [message, setMessage] = useState("")
    const [showPopup, setShowPopup] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (sessionStorage.getItem("accessToken")) {
            router.push("/dashboard")
        }
    }, [])

    const handleSubmit = async () => {
        if (!username || !email || !pass || !confirmPass) {
            alert("Please fill in all fields")
            return
        }
        if (pass != confirmPass) {
            alert("Passwords do not match")
            return
        }
        const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, email, pass, confirmPass }) })

        // ✅ read the message from the server
        const data = await res.json()
        setMessage(data.message)
        setIsSuccess(res.ok)
        setShowPopup(true)

        // ✅ only clear fields if successful
        if (res.ok) {
            setUsername("")
            setEmail("")
            setPass("")
            setConfirmPass("")
        }
    }

    return (
        <div className="bg-slate-950 min-h-screen flex items-center justify-center px-4">

            {/* Popup */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50">

                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black opacity-60" onClick={() => setShowPopup(false)} />

                    {/* Box */}
                    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 w-full max-w-sm mx-4">
                        <div className={`text-4xl ${isSuccess ? "text-green-400" : "text-red-400"}`}>
                            {isSuccess ? "✅" : "❌"}
                        </div>
                        <p className={`text-base font-semibold text-center ${isSuccess ? "text-green-400" : "text-red-400"}`}>
                            {message}
                        </p>
                        <button
                            onClick={() => setShowPopup(false)}
                            className={`px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all ${isSuccess ? "bg-green-500 hover:bg-green-400" : "bg-red-500 hover:bg-red-400"}`}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

                {/* Top accent bar */}
                <div className="h-1.5 w-full bg-green-500" />

                <div className="flex flex-col gap-5 p-8">

                    {/* Header */}
                    <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🛡️</span>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Create Account</h1>
                        </div>
                        <p className="text-sm text-slate-400">Join PassOp and secure your passwords</p>
                    </div>

                    {/* Username */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm placeholder-slate-600"
                            placeholder="john_doe"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm placeholder-slate-600"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                        <input
                            type="password"
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm placeholder-slate-600"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPass}
                            onChange={e => setConfirmPass(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm placeholder-slate-600"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-bold py-3 rounded-xl transition-all duration-200 text-sm mt-2 shadow-lg shadow-green-900"
                    >
                        Create Account 🚀
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-700" />
                        <span className="text-xs text-slate-500">or</span>
                        <div className="flex-1 h-px bg-slate-700" />
                    </div>

                    {/* Login Link */}
                    <div className="flex justify-center gap-2 text-sm">
                        <div className="text-slate-500">Already have an account?</div>
                        <div className="text-green-400 font-semibold cursor-pointer hover:underline">
                            <Link href="/login">Login To Your Account!</Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}