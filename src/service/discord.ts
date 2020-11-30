import { Client as Eris } from 'eris';

// Create a new Eris client with rest mode enabled
export const bot = new Eris(process.env.BOT_TOKEN || "lol", { restMode: true })

export const connectDiscord = async () => {
    try {
        await bot.connect();
        console.log(`[✅] Discord connected`);
    } catch (err) {
        console.log(`[❌] Discord error: ${err}`);
    }
}