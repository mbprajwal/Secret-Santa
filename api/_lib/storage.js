import { kv } from '@vercel/kv';

// In-memory fallback for development or if KV is not configured.
// Note: This does NOT persist across function invocations in serverless.
const memoryStore = new Map();

export const saveMatch = async (id, data) => {
    // Debug logging to specific Vercel logs
    console.log(`[STORAGE] Saving match ${id}. KV Configured: ${!!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)}`);

    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
            await kv.set(`match:${id}`, data);
            console.log(`[STORAGE] Successfully saved to KV: match:${id}`);
        } catch (e) {
            console.error(`[STORAGE] Failed to save to KV:`, e);
            throw e;
        }
    } else {
        console.warn('[STORAGE] KV not configured, using memory store (data will be lost in serverless)');
        memoryStore.set(id, data);
    }
};

export const deleteMatch = async (id) => {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await kv.del(`match:${id}`);
    } else {
        memoryStore.delete(id);
    }
};

export const getMatch = async (id) => {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        return await kv.get(`match:${id}`);
    } else {
        return memoryStore.get(id);
    }
};
