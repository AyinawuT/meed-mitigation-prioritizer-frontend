import { Router, type IRouter } from "express";
import healthRouter from "./health";
import prioritizeRouter from "./prioritize";
import geocodeRouter from "./geocode";
import hiapProxyRouter from "./hiapProxy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(hiapProxyRouter);
router.use(prioritizeRouter);
router.use(geocodeRouter);

export default router;
