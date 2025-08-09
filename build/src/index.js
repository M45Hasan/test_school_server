"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const path = require("path");
const path_1 = require("path");
// env check
const envFilePath = path.resolve(__dirname, "../.env");
const env = require("dotenv").config({ path: envFilePath });
if (env.error) {
    throw new Error(`Unable to load the .env file from ${envFilePath}`);
}
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
// local imports
const logger_1 = __importDefault(require("./utils/logger"));
const index_1 = __importDefault(require("./v1/routes/index"));
const errorHandler_1 = require("./error/errorHandler");
const db_config_1 = require("../config/db.config");
const app = (0, express_1.default)();
// Serve static files from React build directory
const buildPath = (0, path_1.join)(__dirname, "../../admin/dist");
app.use(express_1.default.static(buildPath));
app.set("view engine", "ejs");
app.use(express_1.default.json({ limit: "5mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "5mb" }));
const PORT = process.env.PORT || 3000;
// Middleware
let allowedOrigins = [
    "http://localhost:8080",
];
app.use((0, cors_1.default)({
    origin: (incomingOrigin, callback) => {
        if (!incomingOrigin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(incomingOrigin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS policy: origin ${incomingOrigin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));
// Enable CORS
app.get("/cors", (req, res) => {
    res.json({ message: "CORS is working properly!" });
});
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
(0, db_config_1.dbConnect)();
app.use((0, express_session_1.default)({
    secret: "temp-secret",
    resave: false,
    saveUninitialized: true,
}));
// app environment end######
app.get("/", (req, res) => {
    res.send("OK");
});
app.get("/endpoints", (req, res) => {
    const endpoints = (0, express_list_endpoints_1.default)(app);
    return res.send(endpoints);
});
// Start the server
app.listen(PORT, () => {
    logger_1.default.info(`Server running on port ${PORT}`);
});
// Register routes
app.use(index_1.default);
// Add this catch-all route after all other routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.use(errorHandler_1.errorHandler);
exports.default = app;
