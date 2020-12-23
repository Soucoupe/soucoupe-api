import Stripe from 'stripe'
import { Router, Request, Response } from "express";

// Router initialization
const router = Router();

const stripe = new Stripe(process.env.STRIPE_KEY || "lol", {
    apiVersion: "2020-08-27",
});

// CreateStripe request interface
interface CreateStripeRequest {
    priceId: string;
}

/**
 * Handles the creation of a new Stripe Session
 * If the user doesn't have an active session, it returns him to 
 */
router.post("/create", async (req: Request, res: Response) => {
    const createSessionReq: CreateStripeRequest = req.body;

    // Invalid request handler
    if (!createSessionReq || !createSessionReq.priceId)
        return res.status(400).json({ error: { message: "Bad request" } });

    if (!req.session || !req.session.userId)
        return res.redirect("/discord/auth")

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: createSessionReq.priceId,
                    // For metered billing, do not pass quantity
                    quantity: 1,
                },
            ],
            metadata: {
                discordId: req.session.userId
            },
            // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
            // the actual Session ID is returned in the query parameter when your customer
            // is redirected to the success page.
            success_url: 'https://example.com/success.html?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://example.com/canceled.html',
        });

        return res.status(200).json({
            sessionId: session.id,
        });
    } catch (err) {
        return res.status(400).json({
            error: {
                message: err.message,
            }
        });
    }
});

router.post("/webhook", async (req: Request, res: Response) => {
    let event;
    const signature = req.headers["stripe-signature"];

    if (!signature) return res.status(400).json({
        error: {
            message: "No signature found.",
        }
    });

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || "lol"
        );
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed. Error: `, err.message);
        return res.status(400).json({
            error: {
                message: err.message,
            }
        });
    }

    if (!event.data || !event.type) return res.status(400).json({
        error: {
            message: "Invalid event.",
        }
    });

    switch (event.type) {
        case "payment_intent.created":
            console.log(event.data.object)
    }

    return res.status(200).json({
        message: "Thanks you!",
    });
});

// Export StripeRouter
export default router;