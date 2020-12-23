import AuthRouter from "./auth/auth";
import DiscordRouter from "./discord/discord"
import StripeRouter from "./stripe/stripe"

export const handlers = {
  AuthRouter,
  DiscordRouter,
  StripeRouter,
};
