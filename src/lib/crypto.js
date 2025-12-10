// src/lib/crypto.js

/**
 * Generates a random AES-GCM key.
 * @returns {Promise<CryptoKey>}
 */
export async function generateKey() {
    return window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypts a message using a key.
 * @param {string} text - The text to encrypt.
 * @param {CryptoKey} key - The key to use.
 * @returns {Promise<{iv: Uint8Array, ciphertext: ArrayBuffer}>}
 */
export async function encrypt(text, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        data
    );

    return { iv, ciphertext };
}

/**
 * Decrypts a message.
 * @param {ArrayBuffer} ciphertext 
 * @param {CryptoKey} key 
 * @param {Uint8Array} iv 
 * @returns {Promise<string>}
 */
export async function decrypt(ciphertext, key, iv) {
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

/**
 * Exports a key to a base64 URL-safe string.
 * @param {CryptoKey} key 
 * @returns {Promise<string>}
 */
export async function exportKey(key) {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    return arrayBufferToBase64(exported);
}

/**
 * Imports a key from a base64 string.
 * @param {string} base64Key 
 * @returns {Promise<CryptoKey>}
 */
export async function importKey(base64Key) {
    const raw = base64ToArrayBuffer(base64Key);
    return window.crypto.subtle.importKey(
        "raw",
        raw,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
    );
}

// Helpers for Base64 <-> ArrayBuffer
export function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    // URL-safe replacement
    return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function base64ToArrayBuffer(base64) {
    // Add back padding if needed
    let b64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) {
        b64 += '=';
    }
    const binary_string = window.atob(b64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Secure Fisher-Yates shuffle.
 * @param {any[]} array 
 * @returns {any[]}
 */
export function secureShuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const randomBuffer = new Uint32Array(1);
        window.crypto.getRandomValues(randomBuffer);
        const j = randomBuffer[0] % (i + 1);
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
