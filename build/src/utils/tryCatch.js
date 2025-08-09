"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trySys = exports.tryCatch = void 0;
const tryCatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res, next);
    }
    catch (error) {
        return next(error);
    }
};
exports.tryCatch = tryCatch;
const trySys = (controller) => async (data, next) => {
    try {
        return await controller(data, next); // Return the value
    }
    catch (error) {
        return next(error);
    }
};
exports.trySys = trySys;
