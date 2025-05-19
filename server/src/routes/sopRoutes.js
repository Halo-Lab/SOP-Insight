import express from 'express';
import { createSop, getSops, updateSop, deleteSop, getDefaultSops } from '../controllers/sopController.js';
import authenticateToken from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SOP:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: Automatically generated ID
 *         title:
 *           type: string
 *           description: SOP name
 *         content:
 *           type: string
 *           description: SOP content
 *         userId:
 *           type: string
 *           description: ID of the SOP owner
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update time
 */

/**
 * @swagger
 * /sop:
 *   post:
 *     summary: Create a new SOP document
 *     tags: [SOPs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: SOP document created successfully
 *       401:
 *         description: Unauthorized request
 *       400:
 *         description: Invalid request
 */
router.post('/', authenticateToken, createSop);

/**
 * @swagger
 * /sop:
 *   get:
 *     summary: Get all SOP documents for the user
 *     tags: [SOPs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of SOP documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SOP'
 *       401:
 *         description: Unauthorized request
 */
router.get('/', authenticateToken, getSops);

/**
 * @swagger
 * /sop/{id}:
 *   put:
 *     summary: Update SOP document
 *     tags: [SOPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the SOP document
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: SOP document updated successfully
 *       401:
 *         description: Unauthorized request
 *       404:
 *         description: SOP document not found
 */
router.put('/:id', authenticateToken, updateSop);

/**
 * @swagger
 * /sop/{id}:
 *   delete:
 *     summary: Delete SOP document
 *     tags: [SOPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the SOP document
 *     responses:
 *       200:
 *         description: SOP document deleted successfully
 *       401:
 *         description: Unauthorized request
 *       404:
 *         description: SOP document not found
 */
router.delete('/:id', authenticateToken, deleteSop);

/**
 * @swagger
 * /sop/default-sops:
 *   get:
 *     summary: Get default SOP templates by role ID
 *     tags: [SOPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the role
 *     responses:
 *       200:
 *         description: List of default SOP templates
 *       401:
 *         description: Unauthorized request
 */
router.get('/default-sops', authenticateToken, getDefaultSops);

export default router; 