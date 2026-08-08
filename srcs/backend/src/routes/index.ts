import { Router } from "express";
import userRoutes from "./user.routes";

const router = Router();

router.use("/test", userRoutes);
router.use("/testBody", userRoutes);

export default router;
