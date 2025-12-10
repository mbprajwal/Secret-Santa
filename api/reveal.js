import { getMatch, deleteMatch } from './_lib/storage.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing ID' });
    }

    try {
        const match = await getMatch(id);

        if (!match) {
            return res.status(410).json({ error: 'This match has already been viewed or does not exist.' });
        }

        // BURN AFTER READING: Delete immediately
        await deleteMatch(id);

        return res.status(200).json(match);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
