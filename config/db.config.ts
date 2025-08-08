import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import log from "../src/utils/logger";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

type Error = {
  stack?: string;
};

function dbConnect() {
  const dbUrl =
    process.env.NODE_ENV === "development"
      ? process.env.DB_URL_D
      : process.env.DB_URL_D;

  mongoose
    .connect(dbUrl || "")
    .then(() => {
      log.info(
        process.env.NODE_ENV === "development"
          ? "Mongo Connected Development!"
          : "Mongo Connected Production!"
      );
    })
    .catch((err) => {
      log.error("Mongo Error:", err.code);
    });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  log.error(err.stack);
  res.status(500).send("Something went wrong!");
});

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("Database Connection Closed Gracefully");
    process.exit(0);
  } catch (err) {
    console.error("Error closing database connection:", err);
    process.exit(1);
  }
});

export { dbConnect };
