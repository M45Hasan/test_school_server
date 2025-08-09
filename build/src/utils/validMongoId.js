"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validMongoId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const validMongoId = (id) => {
    const mx = mongoose_1.default.isValidObjectId(id);
    return mx;
};
exports.validMongoId = validMongoId;
