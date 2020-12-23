import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { redis } from "./service/redis"
import { handlers } from "./routes/index";
import { connectDatabase } from "./service/database";
import { connectDiscord } from "./service/discord";
import session from "express-session";
import connectRedis from "connect-redis";
import * as http from 'http';

// Express intiialization
const app = express();

// Defining listening port for Express
const port: number = Number(process.env.PORT) || 8080;

// Connect Redis
const RedisStore = connectRedis(session);


// Express Configuration
app.use(helmet());
app.use(express.json({
  verify: function (req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: string) {
    if (req.url!.startsWith("/stripe/webhook")) {
      req.rawBody = buf.toString();
    }
  },
}));

app.use(
  session({
    store: new RedisStore({
      client: redis as any
    }),
    name: "qid",
    secret: process.env.SESSION_SECRET || "lol",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  }))

// Route handlers
app.use("/auth", handlers.AuthRouter);
app.use("/discord", handlers.DiscordRouter);
app.use("/stripe", handlers.StripeRouter);


/**
 * Start listening on specified port
 */
const startServer = async () => {
  try {
    app.listen(port);
    console.log(`[✅] Express listening on ${port}`);
  } catch (err) {
    console.error(`[❌] Express error: ${err}`);
  }
};

(async () => {
  startServer();
  connectDiscord();
  connectDatabase();
})();
