import { Router, type IRouter } from "express";
import healthRouter from "./health";
import prioritizeRouter from "./prioritize";

const router: IRouter = Router();

router.use(healthRouter);
router.use(prioritizeRouter);

export default router;
