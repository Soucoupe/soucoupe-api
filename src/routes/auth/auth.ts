import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Key, IKey } from "../../models/Key";
import { bot } from "../../service/discord"

// Router initialization
const router = Router();

// Authentication request interface
interface AuthRequest {
  key: string;
  machineId: string;
  discordId: string;
}

/**
 * Handles an key create request which will either
 * Register a new key
 * Return that they are not admin
 */
router.post("/create", async (req: Request, res: Response) => {
  const authReq: AuthRequest = req.body;

  // Invalid request handler
  if (!authReq || !authReq.key)
    return res.status(400).send({ message: "Bad request" });

  let keyResult = await Key.findOne({ key: authReq.key });

  // Invalid key handler or not an admin
  if (!keyResult || !keyResult.admin) return res.status(401).send({ message: "Invalid key" });

  // Generate a new UUID (a new key)
  const generatedKey = uuidv4()
  const key = <IKey>{
    key: generatedKey,
  }

  // Create new key in the DB
  await Key.create(key)

  return res.status(200).send({ message: generatedKey });
});

/**
 * Handles an authentication request which will either
 * Register a new machineID to a key
 * Verify the machineID and key already exist in the DB (match)
 * Return the key is already bound to a different machine
 */
router.post("/verify", async (req: Request, res: Response) => {
  const authReq: AuthRequest = req.body;

  // Invalid request handler
  if (!authReq || !authReq.key || !authReq.machineId)
    return res.status(400).send({ error: { message: "Bad request" }});

  let keyResult = await Key.findOne({ key: authReq.key });

  // Invalid key handler
  if (!keyResult) return res.status(401).send({ error: { message: "Invalid key" } });

  // Invalid discordId handler
  if (!keyResult.discordId) return res.status(401).send({ error: { message: "Link your Discord on the dashboard first." } });

  // Key authentication handler
  if (!keyResult.machineId) {
    // Updates the machineId in the database to the supplied key
    keyResult.machineId = authReq.machineId;

    await keyResult.save();

    return res.status(200).send({ message: "Success", username: keyResult.discordUsername });
  } else {
    // MachineId exists within DB, return result based on if the supplied machineId matches the DB entry
    return keyResult.machineId == authReq.machineId
      ? res.status(200).json({ message: "Success", username: keyResult.discordUsername })
      : res.status(401).send({ error: { message: "The key is already bound." } });
  }
});

/**
 * Handles a reset request to have a machineID unbound from a key
 */
router.post("/reset", async (req: Request, res: Response) => {
  const authReq: AuthRequest = req.body;

  // Invalid request handler
  if (!authReq || !authReq.key)
    return res.status(400).json({ error: { message: "Bad request" } });

  let keyResult = await Key.findOne({ key: authReq.key });

  // Invalid key handler
  if (!keyResult) return res.status(401).json({ error: { message: "Invalid key" } });

  // Sets machineId to empty string and returns success
  keyResult.machineId = null;

  await keyResult.save();
  return res.status(200).json({ message: "Key reset" });
});


/**
 * Handles an unbind request to have a discordId unbound from a key
 */
router.post("/unbind", async (req: Request, res: Response) => {
  const authReq: AuthRequest = req.body;

  // Invalid request handler
  if (!authReq || !authReq.key)
    return res.status(400).json({ error: { message: "Bad request" } });

  let keyResult = await Key.findOne({ key: authReq.key });

  // Invalid key handler
  if (!keyResult) return res.status(401).json({ error: { message: "Invalid key" } });

  if (!keyResult.discordId) return res.status(401).json({ error: { message: "The key is already unbound." } });

  // Sets discordId to empty string and returns success
  keyResult.discordId = null;
  keyResult.discordUsername = null;

  await keyResult.save();
  return res.status(200).json({ message: "Success" });
});

/**
 * Handles a bind request to have a discordId bound to a key
 */
router.post("/bind", async (req: Request, res: Response) => {
  const authReq: AuthRequest = req.body;

  // Invalid request handler
  if (!authReq || !authReq.key || !authReq.discordId)
    return res.status(400).json({ error: { message: "Bad request" } });

  let keyResult = await Key.findOne({ key: authReq.key });

  // Invalid key handler
  if (!keyResult) return res.status(401).json({ error: { message: "Invalid key" } });

  // Key already binded                                                                         
  if (keyResult.discordId) return res.status(401).send({ error: { message: "The key is already bound." } });

  const discordUser = await bot.getRESTUser(authReq.discordId);

  if (!discordUser) return res.status(401).send({ error: { message: "Discord user not found" } });

  // Sets discordId to given discordId and returns success
  keyResult.discordId = authReq.discordId;
  keyResult.discordUsername = `${discordUser.username}#${discordUser.discriminator}`

  await keyResult.save();
  return res.status(200).json({ message: "Success" });
});


/**
 * Handles a heartbeat request to ensure the machineID
 * Is still registered to a key within the database
 */
router.get("/heartbeat/:machineId", async (req: Request, res: Response) => {
  let { machineId } = req.params;

  let machineIdResult = await Key.findOne({ machineId });

  // Returns the result of checking the DB for a record containing the supplied machineId
  return machineIdResult
    ? res.status(200).json({ message: "Success" })
    : res.status(401).json({ message: "Invalid" });
});

// Export AuthRouter
export default router;
