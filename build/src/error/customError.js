"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoServerError = exports.ZodError = exports.InternalServerError = exports.UnprocessableEntity = exports.NotAcceptable = exports.NotFoundError = exports.Forbidden = exports.PaymentRequired = exports.Unauthorized = exports.BadRequestError = void 0;
class CustomError extends Error {
    constructor(message, status, hint) {
        super(message);
        this.status = status;
        this.hint = hint;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
class BadRequestError extends CustomError {
    constructor(message, hint) {
        super(message, 400, hint);
        this.name = "BadRequestError";
    }
}
exports.BadRequestError = BadRequestError;
class ZodError extends CustomError {
    constructor(message, hint) {
        super(message, 400, hint);
        this.name = "ZodError";
    }
}
exports.ZodError = ZodError;
class Unauthorized extends CustomError {
    constructor(message, hint) {
        super(message, 401, hint);
        this.name = "Unauthorized";
    }
}
exports.Unauthorized = Unauthorized;
class PaymentRequired extends CustomError {
    constructor(message, hint) {
        super(message, 402, hint);
        this.name = "PaymentRequired";
    }
}
exports.PaymentRequired = PaymentRequired;
class Forbidden extends CustomError {
    constructor(message, hint) {
        super(message, 403, hint);
        this.name = "Forbidden";
    }
}
exports.Forbidden = Forbidden;
class NotFoundError extends CustomError {
    constructor(message, hint) {
        super(message, 404, hint);
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
class NotAcceptable extends CustomError {
    constructor(message, hint) {
        super(message, 406, hint);
        this.name = "NotAcceptable";
    }
}
exports.NotAcceptable = NotAcceptable;
class UnprocessableEntity extends CustomError {
    constructor(message, hint) {
        super(message, 422, hint);
        this.name = "UnprocessableEntity";
    }
}
exports.UnprocessableEntity = UnprocessableEntity;
class InternalServerError extends CustomError {
    constructor(message, hint) {
        super(message, 500, hint);
        this.name = "InternalServerError";
    }
}
exports.InternalServerError = InternalServerError;
class MongoServerError extends CustomError {
    constructor(message, hint) {
        super(message, 11000, hint);
        this.name = "MongoServerError";
    }
}
exports.MongoServerError = MongoServerError;
