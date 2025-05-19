import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.SERVER_PORT || 3000;
const HOST = process.env.SERVER_HOST || 'localhost';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SOPInsight API',
      version: '1.0.0',
      description: 'Documentation for SOPInsight API',
      contact: {
        name: 'Halo Lab',
      },
    },
    servers: [
      {
        url: `http://${HOST}:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi }; 