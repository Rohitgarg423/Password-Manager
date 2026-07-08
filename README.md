# PassOp — Secure Password Manager

A full-stack password manager built to securely store, retrieve, and manage credentials with strong encryption and authentication practices.

## Features

- 🔐 **AES-256-GCM Encryption** — All stored passwords are encrypted at rest using authenticated encryption, ensuring both confidentiality and integrity.
- 🔑 **JWT Authentication with Refresh Token Rotation** — Access tokens are short-lived; refresh tokens rotate on use to reduce the risk of token theft/replay.
- 🚦 **Rate Limiting** — Login and sensitive routes are protected against brute-force attacks using `rate-limiter-flexible`.
- 📋 **CRUD for Credentials** — Add, view, and delete stored passwords through a clean dashboard.
- 🎨 **Responsive UI** — Built with Tailwind CSS v4.

## Tech Stack

| Layer          | Technology                    |
|----------------|--------------------------------|
| Framework      | Next.js 14 (App Router)        |
| Database       | MongoDB + Mongoose             |
| Auth           | JWT (access + refresh tokens)  |
| Encryption     | AES-256-GCM                    |
| Rate Limiting  | rate-limiter-flexible          |
| Styling        | Tailwind CSS v4                |

## How It Works

1. **Registration/Login** — Users sign up and log in; passwords are hashed, and JWT access + refresh tokens are issued.
2. **Token Rotation** — On each refresh, the old refresh token is invalidated and a new one is issued, limiting the damage of a leaked token.
3. **Storing Passwords** — Credentials submitted by the user are encrypted server-side with AES-256-GCM before being saved to MongoDB.
4. **Retrieving Passwords** — Encrypted data is decrypted only after authentication, and only for the authenticated user's own records.
5. **Rate Limiting** — Sensitive endpoints (like login) are throttled to prevent brute-force attempts.

## Getting Started

### Clone the repository

    git clone https://github.com/Rohitgarg423/Password-Manager.git
    cd Password-Manager
    npm install

### Environment variables

Create a `.env` file in the root with:

    JWT_SECRET=your_jwt_secret
    JWT_REFRESH_SECRET=your_refresh_secret
    ENCRYPTION_KEY=your_32_byte_encryption_key
    MONGODB_URI=your_mongodb_connection_string

### Run the dev server

    npm run dev

## Project Motivation

Built as a portfolio project to demonstrate practical, production-style security patterns — encryption, token rotation, and rate limiting — rather than a toy CRUD app.