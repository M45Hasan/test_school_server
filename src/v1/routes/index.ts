import dotenv from "dotenv";
import { Router, Request, Response } from "express";


dotenv.config();

const _ = Router();
import apiRoute from "./apis";

const api = process.env.BASE_URL_V1 || "";
console.log("SERVER_URL:", process.env.SERVER_URL);

console.log({ api });

_.use(api, apiRoute);

_.use(api, (req: Request, res: Response) => {
  const method = req.method;
  console.log(req.url);
  return res.send(
    `API not found.
    Method: ${method},
    Host: ${process.env.SERVER_URL},
    Base: ${api},
    Endpoint: ${req.path}`
  );
});

export default _;
