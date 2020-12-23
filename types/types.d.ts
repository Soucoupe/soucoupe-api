// add it to merging definition
import { SessionData } from "express-session";
import { IncomingMessage } from "http";

// Add field to session
declare module "express-session" {
    interface SessionData {
        userId: string;
    }
  }
  
  // Add rawbody to express 
  declare module 'http' {
    interface IncomingMessage {
        rawBody: any;
    }
  }
  