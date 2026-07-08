import crypto from "crypto"

const algorithm = "aes-256-gcm"
const key = Buffer.from(process.env.ENCRYPTION_KEY, "utf-8") // must be 32 chars

export const encrypt = (text) => {
    const iv = crypto.randomBytes(12)  // GCM uses 12 bytes iv
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
    const authTag = cipher.getAuthTag()  // ✅ GCM authentication tag

    // store iv + authTag + encrypted together
    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted.toString("hex")
}

export const decrypt = (text) => {
    const [iv, authTag, encrypted] = text.split(":")
    
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, "hex"))
    decipher.setAuthTag(Buffer.from(authTag, "hex"))  // ✅ verify auth tag
    
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encrypted, "hex")),
        decipher.final()
    ])
    
    return decrypted.toString()
}