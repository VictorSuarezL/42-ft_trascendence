import { Router } from "express";
import { userCheck, userCheckBody } from "../controllers/user.controller";

const router = Router();

router.get("/", userCheck);
router.post("/", userCheckBody);

export default router;
