"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appStatus = (code, data, req, res) => {
    let responseData = {
        status: code,
        success: true,
        path: req.originalUrl,
    };
    if (data !== undefined) {
        responseData.data = data;
    }
    switch (code) {
        case 200:
            responseData.message = "The request has succeeded";
            break;
        case 201:
            responseData.message =
                "The request has succeeded and a new resource has been created";
            break;
        case 204:
            responseData.message = "Delete or Update Success";
            break;
        default:
            responseData.message = "Unknown Status";
    }
    return res.status(code).json(responseData);
};
exports.default = appStatus;
