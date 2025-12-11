import { put, list, del } from '@vercel/blob';

// In-memory fallback for local development
const memoryStore = new Map();

export const saveMatch = async (id, data) => {
    console.log(`[STORAGE] Saving match ${id}. BLOB_READ_WRITE_TOKEN Configured: ${!!process.env.BLOB_READ_WRITE_TOKEN}`);

    if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
            // Save as a JSON file in the 'matches' folder
            await put(`matches/${id}.json`, JSON.stringify(data), {
                access: 'public',
                contentType: 'application/json',
                addRandomSuffix: false // Ensure exact filename match
            });
            console.log(`[STORAGE] Successfully saved to Vercel Blob: matches/${id}.json`);
        } catch (e) {
            console.error(`[STORAGE] Failed to save to Blob:`, e);
            throw e;
        }
    } else {
        console.warn('[STORAGE] Blob not configured, using memory store (data will be lost in serverless)');
        memoryStore.set(id, data);
    }
};

export const deleteMatch = async (id) => {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
        // Blob API requires the full URL to delete
        // List to find the URL for this ID
        const { blobs } = await list({ prefix: `matches/${id}.json` });
        if (blobs.length > 0) {
            await del(blobs.map(b => b.url));
            console.log(`[STORAGE] Deleted blob: matches/${id}.json`);
        }
    } else {
        memoryStore.delete(id);
    }
};

export const getMatch = async (id) => {
    console.log(`[STORAGE] Getting match ${id}...`);

    if (process.env.BLOB_READ_WRITE_TOKEN) {
        // We have to fetch the URL content
        const { blobs } = await list({ prefix: `matches/${id}.json` });

        if (blobs.length === 0) return null;

        // Fetch the content of the blob
        const response = await fetch(blobs[0].url);
        if (!response.ok) return null;

        return await response.json();
    } else {
        return memoryStore.get(id);
    }
};
