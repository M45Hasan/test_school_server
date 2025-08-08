import { Request, Response } from "express";

interface ResponseData {
  data?: object;
  status: number;
  success: boolean;
  message?: string;
  path?: string;
}

const appStatus = (
  code: number,
  data: any | undefined,
  req: Request,
  res: Response
): Response => {
  let responseData: ResponseData = {
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

export default appStatus;
