import { connect } from "mongoose";

const connectionURI: string =
  process.env.mongoURI ||
  "mongodb://ryuk:abc123@localhost/soucoupe?retryWrites=true&w=majority";

export const connectDatabase = async () => {
  try {
    connect(connectionURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log(`[✅] Database connected`);
  } catch (err) {
    console.log(`[❌] Database error: ${err}`);
  }
};
