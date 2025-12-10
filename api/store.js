import { saveMatch } from './_lib/storage.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { matches } = req.body;

        if (!Array.isArray(matches)) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        // Process all in parallel
        await Promise.all(matches.map(m => saveMatch(m.id, {
            encryptedMatch: m.encryptedMatch,
            iv: m.iv
        })));

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
