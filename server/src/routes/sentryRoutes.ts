import express from "express";
import { testSentry } from "../controllers/sentryController.js";
import { asHandler } from "../types/express.js";

const router = express.Router();

/**
 * @swagger
 * /test-sentry/test:
 *   get:
 *     summary: Check Sentry integration
 *     tags: [Sentry]
 *     description: Calls a test error to check Sentry integration
 *     responses:
 *       500:
 *         description: Test error for Sentry
 */
router.get("/test", asHandler(testSentry));

export default router;
