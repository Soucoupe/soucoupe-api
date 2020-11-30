import { Schema, model, Document } from "mongoose";

/**
 * Interface for defining Key
 */
export interface IKey extends Document {
  key: string;
  discordId: string | null;
  discordUsername: string | null;
  machineId: string | null;
  admin: boolean | null;
  createdDate: Date;
}

/**
 * Schema to handle keys
 */
const keySchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  discordId: {
    type: String,
    required: false,
    unique: false,
  },
  discordUsername: {
    type: String,
    required: false,
    unique: false,
  },
  machineId: {
    type: String,
    required: false,
    unique: false,
  },
  admin: {
    type: Boolean,
    default: false,
    required: false,
    unique: false,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

export const Key = model<IKey>("Key", keySchema);
