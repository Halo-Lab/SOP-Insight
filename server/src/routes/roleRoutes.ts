import express from "express";
import { getRoles } from "../controllers/roleController.js";
import authenticateToken from "../middlewares/auth.js";
import { asHandler } from "../types/express.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the role
 *         name:
 *           type: string
 *           description: Role name
 *         description:
 *           type: string
 *           description: Role description
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all available roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       401:
 *         description: Unauthorized request
 */
router.get("/", asHandler(authenticateToken), asHandler(getRoles));

export default router;
