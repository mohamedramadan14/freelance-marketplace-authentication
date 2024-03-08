import { health } from '@authentication/controllers/health';
import express, { Router } from 'express';

const router: Router = express.Router();

const healthRoutes = (): Router => {
  router.get('/auth-health', health);

  return router;
};

export { healthRoutes };
