import { Router } from "express";

import auth from "./auth.api";
import question from "./question.api";
const _ = Router();

_.use("/auth", auth);
_.use("/questions", question);
export default _;
