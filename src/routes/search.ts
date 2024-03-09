import { gigsSearch, searchGigById } from '@authentication/controllers/search';
import express, { Router } from 'express';

const router: Router = express.Router();

const searchRoutes = (): Router => {
  router.get('/search/gig/:from/:size/:type', gigsSearch);
  router.get('/search/gig/:gigId', searchGigById);
  return router;
};

export { searchRoutes };
