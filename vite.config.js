import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

import storeHandler from './api/store.js'
import revealHandler from './api/reveal.js'
import notifyHandler from './api/notify.js'

// Simple adapter to make Vercel serverless functions work in Vite middleware
const apiAdapter = (handler) => async (req, res, next) => {
    // Mock Vercel/Express-like response methods
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
    };

    // Parse body if needed (Vite/Connect doesn't do this by default for JSON)
    if (req.method === 'POST') {
        const buffers = [];
        for await (const chunk of req) {
            buffers.push(chunk);
        }
        const data = Buffer.concat(buffers).toString();
        try {
            req.body = JSON.parse(data);
        } catch (e) {
            req.body = null;
        }
    } else {
        // For GET querystrings
        const url = new URL(req.url, `http://${req.headers.host}`);
        req.query = Object.fromEntries(url.searchParams.entries());
    }

    try {
        await handler(req, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'vercel-api-middleware',
            configureServer(server) {
                server.middlewares.use('/api/store', apiAdapter(storeHandler));
                server.middlewares.use('/api/reveal', apiAdapter(revealHandler));
                server.middlewares.use('/api/notify', apiAdapter(notifyHandler));
            }
        }
    ],
})
