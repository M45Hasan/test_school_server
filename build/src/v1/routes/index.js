"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = require("express");
dotenv_1.default.config();
const _ = (0, express_1.Router)();
const apis_1 = __importDefault(require("./apis"));
const api = process.env.BASE_URL_V1 || "";
console.log("SERVER_URL:", process.env.SERVER_URL);
console.log({ api });
_.use(api, apis_1.default);
_.use(api, (req, res) => {
    const method = req.method;
    console.log(req.url);
    return res.send(`API not found.
    Method: ${method},
    Host: ${process.env.SERVER_URL},
    Base: ${api},
    Endpoint: ${req.path}`);
});
exports.default = _;
