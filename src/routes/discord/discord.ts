import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import { URLSearchParams } from "url"

// Router initialization
const router = Router();

// Setup Discord client ID/Secret
const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const REDIRECT_URI = 'http://localhost:4000/discord/callback'

/**
 * Handles discord OAuth
 * Redirect to Discord OAuth directly
 */
router.get("/auth", async (req: Request, res: Response) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=guilds.join%20identify`)
});

router.get("/callback", async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code) return res.status(401).json({ message: "Invalid code" });

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
    });

    try {
        const tokenRes = await fetch('https://discordapp.com/api/oauth2/token', { method: "POST", body: params });
        const token = await tokenRes.json();

        const userRes = await fetch(`https://discord.com/api/v6/users/@me`, {
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        });
        const userData = await userRes.json()
        if (userRes.status != 200) return res.status(401).json({ error: { message: userData.message } });

        // TODO: set userid in the session

        req.session.userId = userData.id

        console.log(req.session.userId);
        
        return res.status(200).json({ data: userData });
    } catch (err) {
        return res.status(400).json({ error: { message: err.message } })
    }
});

// Export AuthRouter
export default router;
