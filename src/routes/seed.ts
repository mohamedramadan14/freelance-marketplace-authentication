import { createSeededUsers } from '@authentication/controllers/seeds';
import express, { Router } from 'express';

const router: Router = express.Router();

const seedRoutes = (): Router => {
  router.put('/seed/:count', createSeededUsers);
  return router;
};

export { seedRoutes };
