class CustomError extends Error {
  status: number;
  hint?: string;

  constructor(message: string, status: number, hint?: string) {
    super(message);
    this.status = status;
    this.hint = hint;
    Object.setPrototypeOf(this, new.target.prototype); 
  }
}

class BadRequestError extends CustomError {
  constructor(message: string, hint?: string) {
    super(message, 400, hint);
    this.name = "BadRequestError";
  }
}
class ZodError extends CustomError {
  constructor(message: string, hint?: string) {
    super(message, 400, hint);
    this.name = "ZodError";
  }
}

class Unauthorized extends CustomError {
  constructor(message: string, hint?: string) {
    super(message, 401, hint);
    this.name = "Unauthorized";
  }
}

class PaymentRequired extends CustomError {
  constructor(message: string, hint?: string) {
    super(message, 402, hint);
    this.name = "PaymentRequired";
  }
}

class Forbidden extends CustomError {
  constructor(message: string, hint?: string) {
    super(message, 403, hint);
    this.name = "Forbidden";
  }
}

class NotFoundError extends CustomError {
  constructor(message: string, hint?: string) {
    super(message, 404, hint);
    this.name = "NotFoundError";
  }
}

class NotAcceptable extends CustomError {
  constructor(message: string, hint?: string) {
    super(message, 406, hint);
    this.name = "NotAcceptable";
  }
}

class UnprocessableEntity extends CustomError {
  constructor(message: string, hint?: string) {
    super(message, 422, hint);
    this.name = "UnprocessableEntity";
  }
}

class InternalServerError extends CustomError {
  constructor(message: string, hint?: string) {
    super(message, 500, hint);
    this.name = "InternalServerError";
  }
}
class MongoServerError extends CustomError {
  constructor(message: string, hint?: string) {
    super(message, 11000, hint);
    this.name = "MongoServerError";
  }
}

export {
  BadRequestError,
  Unauthorized,
  PaymentRequired,
  Forbidden,
  NotFoundError,
  NotAcceptable,
  UnprocessableEntity,
  InternalServerError,
  ZodError,
  MongoServerError,
};
