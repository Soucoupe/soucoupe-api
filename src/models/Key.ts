import { Schema, model, Document } from "mongoose";

function addMonths(date: Date, months: number) {
  var d = date.getDate();
  date.setMonth(date.getMonth() + +months);
  if (date.getDate() != d) {
    date.setDate(0);
  }
  return date;
}


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
 * Schema to handle user (only stripeId)
 */
const userSchema = new Schema({
  stripeId: {
    type: String,
    required: false,
    unique: false,
  },
})

/**
 * Schema to handle Invoice
 */
const invoiceSchema = new Schema({
  createdDate: {
    type: Date,
    default: Date.now,
  },
})
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
  endPeriod: {
    type: Date,
    unique: false,
    default: addMonths(new Date(), 1).getTime(),
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

export const Key = model<IKey>("Key", keySchema);
