import { Router } from "express";

import auth from "./auth.api";
import question from "./question.api";
import test from "./test.api";
import atm from "./attempt.api";
import certificate from "./certificate.api";
const _ = Router();

_.use("/auth", auth);
_.use("/questions", question);
_.use("/tests", test);
_.use("/attempts", atm);
_.use("/certificates", certificate);
export default _;
