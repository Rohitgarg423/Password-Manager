"use client"
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const isDashboard = pathname === "/dashboard"
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    const c = confirm("Are you sure you want to logout?")
    if (!c) return
    await fetch("/api/logout")
    // sessionStorage.removeItem("accessToken")
    router.push("/login")
  }

  return (
    <>
      <nav style={{ backgroundColor: "#020617" }} className="flex items-center justify-between px-10 py-4 border-b border-slate-800 shadow-lg">
        <Link href="/">
          <div className="flex items-center gap-2">
            <div className="bg-green-500 p-2 rounded-lg">
              <span className="text-xl">🔒</span>
            </div>
            <div className="text-white font-extrabold text-2xl tracking-tight">
              Pass<span className="text-green-400">Op</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {isDashboard ? (
            // ✅ logout button in navbar — always visible when not scrolled
            <div
              onClick={handleLogout}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-400 rounded-xl transition-all duration-200 cursor-pointer">
              🚪 Logout
            </div>) : (
            <>
              <Link href="/login">
                <div className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200 cursor-pointer">
                  Login
                </div>
              </Link>
              <Link href="/register">
                <div className="px-5 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-400 rounded-xl shadow-md shadow-green-900 transition-all duration-200 cursor-pointer">
                  Create Account
                </div>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ✅ fixed logout button — only appears when navbar is scrolled out of view */}
      {isDashboard && scrolled && (
        <div className="fixed top-4 right-6 z-50 animate-fade-in">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-400 active:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-xl transition-all duration-200 text-sm">
            🚪 Logout
          </button>
        </div>
      )}
    </>
  )
}