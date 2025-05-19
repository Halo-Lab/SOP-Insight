import express from "express";
import {
  analyzeTranscripts,
  analyzeTranscriptsStream,
  saveAnalysisHistory,
  getAnalysisHistory,
  getAnalysisHistoryItem,
  deleteAnalysisHistory,
  updateAnalysisHistoryName,
} from "../controllers/analyzeController.js";
import authenticateToken from "../middlewares/auth.js";
import { asHandler } from "../types/express.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Analysis:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Automatically generated ID
 *         name:
 *           type: string
 *           description: Analysis name
 *         results:
 *           type: string
 *           description: Stringified JSON containing analysis results
 *         user_id:
 *           type: string
 *           description: ID of the user
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation time
 */

/**
 * @swagger
 * /analyze:
 *   post:
 *     summary: Analyze transcripts
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transcripts
 *               - sops
 *             properties:
 *               transcripts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of transcript texts to analyze
 *               sops:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of SOP content strings for analysis
 *     responses:
 *       200:
 *         description: Analysis completed successfully
 *       401:
 *         description: Unauthorized request
 *       400:
 *         description: Invalid request
 */
router.post("/", asHandler(authenticateToken), asHandler(analyzeTranscripts));

/**
 * @swagger
 * /analyze/stream:
 *   post:
 *     summary: Analyze transcripts with stream response
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transcripts
 *               - sops
 *             properties:
 *               transcripts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of transcript texts to analyze
 *               sops:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of SOP content strings for analysis
 *     responses:
 *       200:
 *         description: Analysis completed successfully (stream response)
 *       401:
 *         description: Unauthorized request
 *       400:
 *         description: Invalid request
 */
router.post(
  "/stream",
  asHandler(authenticateToken),
  asHandler(analyzeTranscriptsStream)
);

/**
 * @swagger
 * /analyze/history:
 *   post:
 *     summary: Save analysis history
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - results
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name for the analysis history
 *               results:
 *                 type: array
 *                 description: Analysis results to save
 *                 items:
 *                   type: object
 *                   properties:
 *                     sop:
 *                       type: string
 *                       description: SOP content or identifier
 *                     analyses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           transcript:
 *                             type: string
 *                             description: Transcript text
 *                           result:
 *                             type: string
 *                             description: Analysis result text
 *                           tokens:
 *                             type: integer
 *                             description: Number of tokens used
 *     responses:
 *       201:
 *         description: Analysis history saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID of the saved analysis
 *                 name:
 *                   type: string
 *                   description: Name of the analysis
 *                 results:
 *                   type: string
 *                   description: Stringified JSON containing analysis results
 *                 user_id:
 *                   type: string
 *                   description: ID of the user
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Creation time
 *       401:
 *         description: Unauthorized request
 */
router.post(
  "/history",
  asHandler(authenticateToken),
  asHandler(saveAnalysisHistory)
);

/**
 * @swagger
 * /analyze/history:
 *   get:
 *     summary: Get analysis history
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of analysis history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Analysis'
 *       401:
 *         description: Unauthorized request
 */
router.get(
  "/history",
  asHandler(authenticateToken),
  asHandler(getAnalysisHistory)
);

/**
 * @swagger
 * /analyze/history/{id}:
 *   get:
 *     summary: Get a specific analysis by ID
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the analysis
 *     responses:
 *       200:
 *         description: Analysis found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Analysis'
 *       401:
 *         description: Unauthorized request
 *       404:
 *         description: Analysis not found
 */
router.get(
  "/history/:id",
  asHandler(authenticateToken),
  asHandler(getAnalysisHistoryItem)
);

/**
 * @swagger
 * /analyze/history/{id}:
 *   delete:
 *     summary: Delete analysis
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the analysis
 *     responses:
 *       200:
 *         description: Analysis deleted successfully
 *       401:
 *         description: Unauthorized request
 *       404:
 *         description: Analysis not found
 */
router.delete(
  "/history/:id",
  asHandler(authenticateToken),
  asHandler(deleteAnalysisHistory)
);

/**
 * @swagger
 * /analyze/history/{id}:
 *   put:
 *     summary: Update analysis name
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the analysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Analysis name updated successfully
 *       401:
 *         description: Unauthorized request
 *       404:
 *         description: Analysis not found
 */
router.put(
  "/history/:id",
  asHandler(authenticateToken),
  asHandler(updateAnalysisHistoryName)
);

export default router;
