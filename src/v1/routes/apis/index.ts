import { Router } from "express";

import auth from "./auth.api";
const _ = Router();

_.use("/auth", auth);
export default _;
