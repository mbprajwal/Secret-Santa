import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { notifications } = req.body; // Array of { name, email, link }

    if (!notifications || !Array.isArray(notifications)) {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("SMTP credentials missing");
        return res.status(503).json({ error: 'Server email not configured (Missing SMTP_USER/SMTP_PASS)' });
    }

    try {
        // Create transporter dynamically
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const results = [];
        const errors = [];

        // Send emails sequentially
        for (const note of notifications) {
            if (!note.email) continue;

            const timestamp = new Date().toLocaleString();

            try {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || '"Secret Santa" <noreply@secretsanta.com>',
                    to: note.email,
                    subject: `🎅 Your Secret Santa Match is Here! [${new Date().toLocaleTimeString()}]`,
                    text: `Hi ${note.name},\n\nYou have been invited to Secret Santa!\n\nClick the link below to see who you got (Link self-destructs after viewing!):\n${note.link}\n\nMerry Christmas!\n\n(Sent at: ${timestamp})`,
                    html: `
              <div style="font-family: sans-serif; padding: 20px; text-align: center;">
                <h1>🎅 Secret Santa</h1>
                <p>Hi <strong>${note.name}</strong>,</p>
                <p>You have been invited to join the fun!</p>
                <div style="margin: 30px 0;">
                  <a href="${note.link}" style="background-color: #D42426; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Reveal My Match
                  </a>
                </div>
                <p style="color: #666; font-size: 12px;">This link will strictly self-destruct after you view it once. Do not share it!</p>
                <p style="color: #999; font-size: 10px; margin-top: 20px;">Sent at: ${timestamp} (ID: ${Date.now()})</p>
              </div>
            `
                });
                results.push(note.email);
            } catch (err) {
                console.error(`Failed to send to ${note.email}`, err);
                errors.push({ email: note.email, error: err.message });
            }
        }

        return res.status(200).json({ success: true, sent: results.length, failed: errors });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
