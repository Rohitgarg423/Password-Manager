"use client"
import Link from "next/link";
import React, { useState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function login231() {
    const [user, setUser] = useState("")
    const [pass, setPass] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [message, setMessage] = useState("")
    const [showPopup, setShowPopup] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const ref = useRef()
    const router = useRouter()

    useEffect(() => {
        if (sessionStorage.getItem("accessToken")) {
            router.push("/dashboard")
        }
    }, [])

    const showPassword = () => {
        if (ref.current.src.includes('eyecross.png')) {
            ref.current.src = 'eye.png'
        } else {
            ref.current.src = 'eyecross.png'
        }
        setShowPass(prev => !prev)
    }
    const handleSubmit = async () => {
        if (!user || !pass) {
            setMessage("Please fill in all fields")
            setIsSuccess(false)
            setShowPopup(true)
            return
        }

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user, pass })
            })

            const data = await res.json()
            setMessage(data.message)
            setIsSuccess(res.ok)
            setShowPopup(true)

            if (res.ok) {
                // sessionStorage.setItem("accessToken", data.accessToken)
                setUser("")
                setPass("")
                router.push("/dashboard")
            }

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="bg-slate-950 min-h-screen flex items-center justify-center px-4">
            {/* Popup */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-60" onClick={() => setShowPopup(false)} />
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
                <div className="h-1.5 w-full bg-green-500" />
                <div className="flex flex-col gap-5 p-8">

                    {/* Header */}
                    <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🔒</span>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Welcome Back</h1>
                        </div>
                        <p className="text-sm text-slate-400">Login to access your PassOp vault</p>
                    </div>

                    {/* Email or Username */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email or Username</label>
                        <input
                            type="text"
                            name="user"
                            value={user}
                            onChange={e => setUser(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm placeholder-slate-600"
                            placeholder="you@example.com or username"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                name="password"
                                value={pass}
                                onChange={e => setPass(e.target.value)}
                                required
                                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm placeholder-slate-600"
                                placeholder="••••••••"
                            />
                            <span className="invert absolute right-3 top-3 cursor-pointer opacity-60 hover:opacity-100 transition-all" onClick={showPassword}>
                                <img ref={ref} className="p-1" width={26} src="eyecross.png" alt="eye" />
                            </span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-bold py-3 rounded-xl transition-all duration-200 text-sm mt-2 shadow-lg shadow-green-900"
                    >
                        Login to PassOp 🔓
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-700" />
                        <span className="text-xs text-slate-500">or</span>
                        <div className="flex-1 h-px bg-slate-700" />
                    </div>

                    {/* Register Link */}
                    <div className="flex justify-center gap-2 text-sm">
                        <div className="text-slate-500">Don't have an account?</div>
                        <div className="text-green-400 font-semibold cursor-pointer hover:underline">
                            <Link href="/register">Create Your Account!</Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}