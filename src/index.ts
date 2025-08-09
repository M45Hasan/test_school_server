import express, { Request, Response } from "express";
import session from "express-session";

const path = require("path");
import { join } from "path";
// env check
const envFilePath = path.resolve(__dirname, "../.env");
const env = require("dotenv").config({ path: envFilePath });
if (env.error) {
  throw new Error(`Unable to load the .env file from ${envFilePath}`);
}
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import listEndpoints from "express-list-endpoints";
// local imports
import logger from "./utils/logger";
import router from "./v1/routes/index";
import { errorHandler } from "./error/errorHandler";
import { dbConnect } from "../config/db.config";

const app = express();
// Serve static files from React build directory
const buildPath = join(__dirname, "../../admin/dist");
app.use(express.static(buildPath));
app.set("view engine", "ejs");
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.static("static"));
app.use("/postman", express.static("postman"));
const PORT = process.env.PORT || 3000;

// Middleware
let allowedOrigins: string[] = ["http://localhost:8080"];

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      if (!incomingOrigin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(incomingOrigin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS policy: origin ${incomingOrigin} not allowed`)
      );
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Enable CORS
app.get("/cors", (req, res) => {
  res.json({ message: "CORS is working properly!" });
});

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

dbConnect();
app.use(
  session({
    secret: "temp-secret",
    resave: false,
    saveUninitialized: true,
  })
);
// postman collection


// app environment end######
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "static/docs.html"));
});


// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
// Register routes
app.use(router);

app.use(errorHandler);
export default app;
