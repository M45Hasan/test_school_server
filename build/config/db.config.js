"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = dbConnect;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../src/utils/logger"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
function dbConnect() {
    const dbUrl = process.env.NODE_ENV === "development"
        ? process.env.DB_URL_D
        : process.env.DB_URL_D;
    mongoose_1.default
        .connect(dbUrl || "")
        .then(() => {
        logger_1.default.info(process.env.NODE_ENV === "development"
            ? "Mongo Connected Development!"
            : "Mongo Connected Production!");
    })
        .catch((err) => {
        logger_1.default.error("Mongo Error:", err.code);
    });
}
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.default.error(err.stack);
    res.status(500).send("Something went wrong!");
});
process.on("SIGINT", async () => {
    try {
        await mongoose_1.default.connection.close();
        console.log("Database Connection Closed Gracefully");
        process.exit(0);
    }
    catch (err) {
        console.error("Error closing database connection:", err);
        process.exit(1);
    }
});
