import { secureShuffle, generateKey, encrypt, exportKey, arrayBufferToBase64 } from './crypto';

/**
 * Generates pairing, keys, and encrypted blobs for a list of participants.
 * @param {Array<{name: string, email?: string}>} participants 
 */
export async function generateSecretSantaPairs(participants) {
    if (participants.length < 2) {
        throw new Error("Need at least 2 participants.");
    }

    // 1. Create a deranged list (no one assigned to themselves)
    // Simple heuristic: Shuffle until valid. For small N this is fast. 
    // For massive N, a directed cycle approach is better, but shuffle is sufficient here.

    let shuffled;
    let isValid = false;
    let attempts = 0;
    const maxAttempts = 1000;

    // We only shuffle the indices to map i -> match_i
    const indices = participants.map((_, i) => i);

    while (!isValid && attempts < maxAttempts) {
        attempts++;
        shuffled = secureShuffle(indices);

        // Check constraints
        isValid = true;
        for (let i = 0; i < shuffled.length; i++) {
            if (shuffled[i] === i) {
                isValid = false;
                break;
            }
        }
    }

    if (!isValid) {
        throw new Error("Could not generate valid pairs after multiple attempts.");
    }

    // 2. Generate keys and encrypt data
    // Result structure:
    // - localData: [ { id, name, key (base64string), link } ] -> For the creator to download/distribute
    // - serverData: [ { id, encryptedMatch (base64), iv (base64) } ] -> To upload to server

    const matches = [];

    for (let i = 0; i < participants.length; i++) {
        const giver = participants[i];
        const receiverIndex = shuffled[i];
        const receiver = participants[receiverIndex];

        // Generate a unique ID for the giver (random string)
        // We can use random values for ID too.
        const idBuffer = new Uint8Array(16);
        window.crypto.getRandomValues(idBuffer);
        const id = arrayBufferToBase64(idBuffer);

        // Generate a symmetric key for this interaction
        const key = await generateKey();
        const keyString = await exportKey(key);

        // Encrypt the receiver's name with Expiration
        // We utilize a JSON object to store metadata securely
        const matchData = {
            text: receiver.name + (receiver.email ? ` (${receiver.email})` : ""),
            expiry: Date.now() + (1 * 60 * 1000) // 1 minute from now
        };
        const { iv, ciphertext } = await encrypt(JSON.stringify(matchData), key);

        matches.push({
            id,
            name: giver.name,
            email: giver.email, // Include giver's email so we can send them the link
            key: keyString,
            encryptedMatch: arrayBufferToBase64(ciphertext),
            iv: arrayBufferToBase64(iv)
        });
    }

    return matches;
}
