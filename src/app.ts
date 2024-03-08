import express, { Express } from 'express';
import { start } from '@authentication/server';
import { databaseConnection } from '@authentication/database';
import { winstonLogger, Level } from '@mohamedramadan14/freelance-shared';
import { config } from '@authentication/config';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTICSEARCH_URL}`, 'Authentication Server', Level.debug);
const initialize = (): void => {
  config.cloudinaryConfig();
  const app: Express = express();
  start(app);
  databaseConnection();
  logger.info('Authentication Service is started Successfully...');
};

initialize();
