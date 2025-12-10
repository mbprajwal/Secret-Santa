import { kv } from '@vercel/kv';
import { createClient } from 'redis';

// In-memory fallback
const memoryStore = new Map();

// Helper to get a redis client if using generic REDIS_URL
let redisClient = null;
async function getRedisClient() {
    if (redisClient) return redisClient;
    if (process.env.REDIS_URL) {
        console.log('[STORAGE] Initializing standard Redis client...');
        const client = createClient({ url: process.env.REDIS_URL });
        client.on('error', err => console.error('[STORAGE] Redis Client Error', err));
        await client.connect();
        redisClient = client;
        return client;
    }
    return null;
}

export const saveMatch = async (id, data) => {
    // Debug logging
    console.log(`[STORAGE] Saving match ${id}.`);
    console.log(`[STORAGE] ENV CHECK: KV_URL=${!!process.env.KV_REST_API_URL}, REDIS_URL=${!!process.env.REDIS_URL}`);

    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        // Use Vercel KV (HTTP)
        await kv.set(`match:${id}`, data);
        console.log(`[STORAGE] Saved to Vercel KV: match:${id}`);
    } else if (process.env.REDIS_URL) {
        // Use standard Redis (TCP)
        try {
            const client = await getRedisClient();
            await client.set(`match:${id}`, JSON.stringify(data));
            console.log(`[STORAGE] Saved to Standard Redis: match:${id}`);
        } catch (e) {
            console.error('[STORAGE] Standard Redis write failed:', e);
            throw e;
        }
    } else {
        console.warn('[STORAGE] NO DB CONFIGURED! Using memory store (data will be lost).');
        memoryStore.set(id, data);
    }
};

export const deleteMatch = async (id) => {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await kv.del(`match:${id}`);
    } else if (process.env.REDIS_URL) {
        const client = await getRedisClient();
        await client.del(`match:${id}`);
    } else {
        memoryStore.delete(id);
    }
};

export const getMatch = async (id) => {
    console.log(`[STORAGE] Getting match ${id}...`);

    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        return await kv.get(`match:${id}`);
    } else if (process.env.REDIS_URL) {
        const client = await getRedisClient();
        const data = await client.get(`match:${id}`);
        return data ? JSON.parse(data) : null;
    } else {
        return memoryStore.get(id);
    }
};
