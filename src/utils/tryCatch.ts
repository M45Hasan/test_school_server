import { Request, Response, NextFunction } from "express";

const tryCatch =
  (
    controller: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void>
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
const trySys =
  <T>(controller: (data: any, next: NextFunction) => Promise<T>) =>
  async (data: any, next: NextFunction) => {
    try {
      return await controller(data, next); // Return the value
    } catch (error) {
     
      return next(error);
    }
  };

export { tryCatch, trySys };
