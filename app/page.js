import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <main className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6">

        <span className="text-sm bg-green-500/10 text-green-400 px-4 py-1 rounded-full border border-green-500/20">
          🔐 Your passwords, safe and simple
        </span>

        <h1 className="text-5xl font-bold leading-tight max-w-xl">
          The Last Password <span className="text-green-400">Manager</span> You'll Ever Need
        </h1>

        <p className="text-slate-400 text-lg max-w-md">
          PassOp stores all your passwords in one secure place. Never forget a password again. Simple, fast and safe.
        </p>

        <div className="flex gap-4 mt-4">
          <Link href="/register" >
          <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all text-sm">
            Get Started — It's Free
          </button>
          </Link>
          <Link href="/login">
          <button className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-xl transition-all text-sm">
            Login to Account
          </button>
          </Link>
        </div>

      </main>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-24 max-w-5xl mx-auto">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3">
          <span className="text-3xl">🛡️</span>
          <h3 className="text-lg font-semibold">Secure Storage</h3>
          <p className="text-slate-400 text-sm">All your passwords are encrypted and stored safely. Only you can access them.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3">
          <span className="text-3xl">⚡</span>
          <h3 className="text-lg font-semibold">Fast & Simple</h3>
          <p className="text-slate-400 text-sm">Add, view and manage your passwords in seconds. No complexity, just simplicity.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3">
          <span className="text-3xl">📋</span>
          <h3 className="text-lg font-semibold">One Click Copy</h3>
          <p className="text-slate-400 text-sm">Copy any password to clipboard instantly with just one click. No more typing.</p>
        </div>

      </section>

    </div>
  );
}