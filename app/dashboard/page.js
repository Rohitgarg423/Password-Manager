"use client"
import { useEffect, useState, useRef } from "react"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from "next/navigation"

// ✅ access token stored in memory — not localStorage/sessionStorage
let accessToken = null

export default function Dashboard() {
    const [mounted, setMounted] = useState(false)
    const [passwords, setPasswords] = useState([])
    const [form, setForm] = useState({ site: "", username: "", password: "" })
    const [showPass, setShowPass] = useState(false)
    const [editId, setEditId] = useState(null)
    const ref = useRef()
    const passwordRef = useRef()
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [username, setUsername] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [visiblePasswords, setVisiblePasswords] = useState({})

    const togglePasswordVisibility = (id) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const getToken = () => accessToken

    // ✅ refresh token function — gets new access token from cookie
    const refreshAccessToken = async () => {
        const refresh = await fetch("/api/refresh")
        if (!refresh.ok) {
            accessToken = null
            router.push("/login")
            return null
        }
        const refreshData = await refresh.json()
        accessToken = refreshData.accessToken  // ✅ store in memory
        return accessToken
    }

    const fetchPasswords = async () => {
        setLoading(true)  // ✅ start loading
        const res = await fetch("/api/passwords/get", {
            headers: { "Authorization": `Bearer ${getToken()}` }
        })
        if (res.status === 401) {
            const newToken = await refreshAccessToken()
            if (!newToken) return
            const retry = await fetch("/api/passwords/get", {
                headers: { "Authorization": `Bearer ${newToken}` }
            })
            const data = await retry.json()
            setPasswords(data.passwords || [])
        } else {
            const data = await res.json()
            setPasswords(data.passwords || [])
        }
        setLoading(false)  // ✅ stop loading
    }

    // ✅ on page load — get access token from refresh token cookie
    useEffect(() => {
        const initAuth = async () => {
            const newToken = await refreshAccessToken()
            if (!newToken) return  // redirected to login

            // ✅ decode token to get username
            const decoded = JSON.parse(atob(newToken.split(".")[1]))
            setUsername(decoded.username)

            setMounted(true)
            fetchPasswords()
        }
        initAuth()
    }, [])

    if (!mounted) return null

    const editPassword = (id) => {
        setEditId(id)
        setForm(passwords.filter(p => p.id === id)[0])
        setPasswords(passwords.filter(p => p.id !== id))
    }

    const getPasswordStrength = (password) => {
        if (!password) return null

        let score = 0
        if (password.length >= 8) score++
        if (/[A-Z]/.test(password)) score++
        if (/[a-z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[!@#$%&*?]/.test(password)) score++

        if (score <= 2) return { label: "Weak", color: "bg-red-500", textColor: "text-red-400", width: "w-1/3" }
        if (score <= 4) return { label: "Medium", color: "bg-yellow-500", textColor: "text-yellow-400", width: "w-2/3" }
        return { label: "Strong", color: "bg-green-500", textColor: "text-green-400", width: "w-full" }
    }

    const generatePassword = () => {
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        const lowercase = "abcdefghijklmnopqrstuvwxyz"
        const numbers = "0123456789"
        const special = "!@#$%&*?"
        const allChars = uppercase + lowercase + numbers + special

        // ✅ guarantee at least one of each type
        let password = ""
        password += uppercase[Math.floor(Math.random() * uppercase.length)]
        password += lowercase[Math.floor(Math.random() * lowercase.length)]
        password += numbers[Math.floor(Math.random() * numbers.length)]
        password += special[Math.floor(Math.random() * special.length)]

        // ✅ fill remaining 12 characters randomly
        for (let i = 0; i < 12; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)]
        }

        // ✅ shuffle to avoid predictable pattern
        password = password.split("").sort(() => Math.random() - 0.5).join("")

        // ✅ set in form
        setForm({ ...form, password })
        setShowPass(true)
        if (ref.current) ref.current.src = '/eye.png'
    }

    const savePassword = async () => {
        if (form.site.length < 3 || form.username.length < 3 || form.password.length < 3) {
            toast.error("Fields must be at least 3 characters!", { theme: "dark" })
            return
        }
        setSaving(true)  // ✅ start saving

        if (editId) {
            const delRes = await fetch("/api/passwords/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
                body: JSON.stringify({ id: editId })
            })
            if (delRes.status === 401) {
                const newToken = await refreshAccessToken()
                if (!newToken) return
                await fetch("/api/passwords/delete", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${newToken}` },
                    body: JSON.stringify({ id: editId })
                })
            }
            setEditId(null)
        }

        let token = getToken()
        const res = await fetch("/api/passwords/add", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(form)
        })

        if (res.status === 401) {
            token = await refreshAccessToken()
            if (!token) return
            await fetch("/api/passwords/add", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(form)
            })
        }

        // ✅ always fetch after save
        await fetchPasswords()
        setForm({ site: "", username: "", password: "" })
        toast.success(editId ? "Password updated!" : "Password saved!", { theme: "dark" })
        setSaving(false)  // ✅ stop saving
    }

    const deletePassword = async (id) => {
        const c = confirm("Do you really want to delete this password?")
        if (!c) return

        setDeletingId(id)  // ✅ start deleting

        const res = await fetch("/api/passwords/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
            body: JSON.stringify({ id })
        })

        if (res.status === 401) {
            const newToken = await refreshAccessToken()
            if (!newToken) return
            await fetch("/api/passwords/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${newToken}` },
                body: JSON.stringify({ id })
            })
        }

        // ✅ fetch after delete instead of using response
        await fetchPasswords()
        toast.success("Password deleted!", { theme: "dark" })
        setDeletingId(null)  // ✅ stop deleting
    }

    const copyText = (text) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard!", { theme: "dark" })
    }

    const showPassword = () => {
        if (ref.current.src.includes('eyecross.png')) {
            ref.current.src = 'eye.png'
        } else {
            ref.current.src = 'eyecross.png'
        }
        setShowPass(prev => !prev)
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })

    }
    const filteredPasswords = passwords.filter(p =>
        p.site.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} theme="dark" />
            <div className="fixed inset-0 -z-10 w-full h-full bg-slate-950">
                <div className="absolute left-0 right-0 top-0 m-auto h-96 w-96 rounded-full bg-green-500 opacity-10 blur-[120px]"></div>
            </div>
            <div className="min-h-screen px-6 md:px-0 mx-auto max-w-5xl pb-32 pt-10">
                <div className="text-center mb-10">
                    <h1 className='text-5xl font-extrabold tracking-tight'>
                        <span className='text-green-400'>&lt;</span>
                        <span className="text-white">Pass</span>
                        <span className='text-green-400'>OP/&gt;</span>
                    </h1>
                    <p className='text-slate-400 text-sm mt-2'>Your personal password vault — safe and simple</p>
                    {/* ✅ show username */}
                    <div className="mt-3 inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-full">
                        <span className="text-green-400 text-sm">👤</span>
                        <span className="text-slate-300 text-sm font-medium">{username}</span>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl mb-10 w-full">
                    <h2 className="text-slate-200 font-bold text-xl mb-6">➕ Add New Password</h2>
                    <div className='flex flex-col gap-5'>
                        <input
                            name='site'
                            onChange={handleChange}
                            value={form.site}
                            placeholder='🌐  Website URL  (e.g. google.com)'
                            className='bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm placeholder-slate-600 w-full'
                            type="text"
                        />
                        <div className='flex flex-col gap-3'>
                            {/* Username + Password side by side */}
                            <div className='flex flex-col md:flex-row gap-5'>
                                <input
                                    name='username'
                                    onChange={handleChange}
                                    value={form.username}
                                    placeholder='👤  Username'
                                    className='bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm placeholder-slate-600 w-full'
                                    type="text" />
                                <div className="relative w-full">
                                    <input
                                        ref={passwordRef}
                                        name='password'
                                        onChange={handleChange}
                                        value={form.password}
                                        placeholder='🔑  Password'
                                        className='bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm placeholder-slate-600 w-full pr-10'
                                        type={showPass ? "text" : "password"} />
                                    <span className='absolute right-3 top-3 cursor-pointer opacity-60 hover:opacity-100 transition-all' onClick={showPassword}>
                                        <img ref={ref} className='p-1 invert' width={26} src="/eyecross.png" alt="eye" />
                                    </span>
                                </div>
                            </div>
                            {/* ✅ strength indicator + generate button — same line under password input */}
                            <div className="flex items-center justify-between gap-3 md:pl-[calc(50%+1.25rem)]">

                                {/* ✅ strength indicator */}
                                {form.password ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="w-24 bg-slate-700 rounded-full h-1.5">
                                            <div className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrength(form.password)?.color} ${getPasswordStrength(form.password)?.width}`} />
                                        </div>
                                        <span className={`text-xs font-semibold ${getPasswordStrength(form.password)?.textColor}`}>
                                            {getPasswordStrength(form.password)?.label}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex-1" />
                                )}

                                {/* ✅ generate button */}
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className='flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-green-500 text-green-400 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0'>
                                    ⚡ Generate Strong Password
                                </button>

                            </div>
                        </div>
                        <div className="flex justify-center mt-2">
                            <button
                                onClick={savePassword}
                                disabled={saving}
                                className='flex justify-center items-center gap-2 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-bold rounded-xl px-10 py-3 transition-all shadow-lg shadow-green-900'>
                                {saving ? (
                                    <>
                                        {/* Spinner */}
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <lord-icon src="https://cdn.lordicon.com/jgnvfzqg.json" trigger="hover"></lord-icon>
                                        Save Password
                                    </>
                                )}
                                Save Password
                            </button>
                        </div>
                    </div>
                </div>
                {/* Search */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="🔍  Search by site name..."
                        className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm placeholder-slate-600 w-full" />
                    {/* ✅ clear button — only shows when search has text */}
                    {search && (
                        <span
                            onClick={() => setSearch("")}
                            className="absolute right-4 top-3.5 text-slate-400 hover:text-white cursor-pointer text-sm">
                            ✕
                        </span>
                    )}
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden w-full">
                    <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
                        <h2 className='font-bold text-xl text-slate-200'>🔐 Your Passwords</h2>
                        {search ? (
                            <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                                {filteredPasswords.length} / {passwords.length} found
                            </span>
                        ) : <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                            {passwords.length} saved
                        </span>}
                    </div>
                    <div className="overflow-x-auto w-full">
                        <table className='w-full table-fixed min-w-150'>
                            <colgroup>
                                <col style={{ width: "30%" }} />
                                <col style={{ width: "25%" }} />
                                <col style={{ width: "25%" }} />
                                <col style={{ width: "20%" }} />
                            </colgroup>
                            <thead className='bg-slate-800'>
                                <tr>
                                    <th className='py-4 px-6 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider'>Site</th>
                                    <th className='py-4 px-6 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider'>Username</th>
                                    <th className='py-4 px-6 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider'>Password</th>
                                    <th className='py-4 px-6 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {/* ✅ loading state */}
                                {loading &&
                                    <tr>
                                        <td colSpan={4}>
                                            <div className="flex items-center justify-center py-20 gap-3">
                                                <svg className="animate-spin h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                <p className="text-slate-400 text-sm">Loading passwords...</p>
                                            </div>
                                        </td>
                                    </tr>
                                }

                                {/* ✅ empty state — only show when not loading */}
                                {!loading && filteredPasswords.length === 0 &&
                                    <tr>
                                        <td colSpan={4}>
                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                <span className="text-6xl">{search ? "🔍" : "🗝️"}</span>
                                                <p className="text-slate-400 font-medium">
                                                    {search ? `No results for "${search}"` : "No passwords saved yet"}
                                                </p>
                                                <p className="text-slate-600 text-sm">
                                                    {search ? "Try a different search term" : "Add your first password above"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                }

                                {!loading && filteredPasswords.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/50 transition-all">
                                        <td className='py-4 px-6'>
                                            <div className='flex items-center gap-2 min-w-0'>
                                                <a style={{ color: "#86efac" }} className='truncate hover:underline text-sm font-medium' href={item.site} target='_blank'>{item.site}</a>
                                                <div className='shrink-0 cursor-pointer opacity-40 hover:opacity-100 transition-all' onClick={() => copyText(item.site)}>
                                                    <lord-icon style={{ width: "18px", height: "18px" }} src="https://cdn.lordicon.com/iykgtsbt.json" trigger="hover" colors="primary:#4ade80"></lord-icon>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-4 px-6'>
                                            <div className='flex items-center gap-2 min-w-0'>
                                                <span className="truncate text-slate-200 text-sm">{item.username}</span>
                                                <div className='shrink-0 cursor-pointer opacity-40 hover:opacity-100 transition-all' onClick={() => copyText(item.username)}>
                                                    <lord-icon style={{ width: "18px", height: "18px" }} src="https://cdn.lordicon.com/iykgtsbt.json" trigger="hover" colors="primary:#4ade80"></lord-icon>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-4 px-6'>
                                            <div className='flex items-center gap-2 min-w-0'>
                                                {/* show real of doted password based on visibility state */}
                                                <span className="truncate text-slate-200 text-sm">
                                                    {visiblePasswords[item.id] ? item.password : '••••••••'}
                                                </span>
                                                <div className='shrink-0 cursor-pointer opacity-40 hover:opacity-100 transition-all' onClick={() => copyText(item.password)}>
                                                    <lord-icon style={{ width: "18px", height: "18px" }} src="https://cdn.lordicon.com/iykgtsbt.json" trigger="hover" colors="primary:#4ade80"></lord-icon>
                                                </div>
                                                {/* eye toggle button */}
                                                <div className='shrink-0 cursor-pointer opacity-40 hover:opacity-100 transition-all' onClick={() => togglePasswordVisibility(item.id)}>
                                                    <img className='p-0.5 invert' width={18} src={visiblePasswords[item.id] ? "/eye.png" : "/eyecross.png"} alt="toggle" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-4 px-6'>
                                            <div className="flex items-center justify-center gap-4">
                                                <span className='cursor-pointer opacity-50 hover:opacity-100 transition-all' onClick={() => editPassword(item.id)}>
                                                    <lord-icon src="https://cdn.lordicon.com/gwlusjdu.json" trigger="hover" colors="primary:#4ade80" style={{ width: "22px", height: "22px" }}></lord-icon>
                                                </span>
                                                {/* ✅ show spinner on delete button for that specific row */}
                                                <span className='cursor-pointer opacity-50 hover:opacity-100 transition-all' onClick={() => deletePassword(item.id)}>
                                                    {deletingId === item.id ? (
                                                        <svg className="animate-spin h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                        </svg>
                                                    ) : (
                                                        <lord-icon src="https://cdn.lordicon.com/skkahier.json" trigger="hover" colors="primary:#f87171" style={{ width: "22px", height: "22px" }}></lord-icon>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className='bg-slate-900 border-t border-slate-800 text-white flex flex-col justify-center items-center fixed bottom-0 w-full py-3'>
                <div className="font-bold text-white text-xl">
                    <span className='text-green-400'>&lt;</span>
                    <span>Pass</span><span className='text-green-400'>OP/&gt;</span>
                </div>
                <div className='flex justify-center items-center text-xs text-slate-500 gap-1 mt-1'>
                    Created with <img className='w-5 mx-1' src="/heart.png" alt="heart" /> by Rohit Garg
                </div>
            </div>
        </>
    )
}