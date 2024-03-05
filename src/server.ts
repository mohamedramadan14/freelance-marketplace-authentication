import http from 'http';

import { Application, Request, Response, NextFunction, json, urlencoded } from 'express';
import { CustomError, IAuthPayload, IErrorResponse, Level, winstonLogger } from '@mohamedramadan14/freelance-shared';
import { Logger } from 'winston';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import compression from 'compression';
import { config } from '@authentication/config';
import { createConnection } from '@authentication/queues/connection';
import { appRoutes } from '@authentication/routes';
import { Channel } from 'amqplib';

const SERVER_PORT = 4002;

const logger: Logger = winstonLogger(`${config.ELASTICSEARCH_URL}`, 'Authentication Server', Level.debug);

export let authChannel: Channel;
export const start = (app: Application): void => {
  securityMiddlewares(app);
  compressionEncodeMiddleware(app);
  routesMiddleware(app);
  startElasticSearch();
  startQueues();
  authErrorHandler(app);
  startServer(app);
};

const securityMiddlewares = (app: Application): void => {
  app.set('trust proxy', true);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const payload: IAuthPayload = jwt.verify(token, `${config.JWT_TOKEN!}`) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
};

const compressionEncodeMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: '150mb' }));
  app.use(urlencoded({ extended: true, limit: '150mb' }));
};

const routesMiddleware = (app: Application): void => {
  appRoutes(app);
};

const startQueues = async (): Promise<void> => {
  authChannel = (await createConnection()) as Channel;
};

const startElasticSearch = (): void => {
  createConnection();
};

const authErrorHandler = (app: Application): void => {
  app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.log('error', `Authentication Service - ${err.comingFrom}`, err);
    if (err instanceof CustomError) {
      res.status(err.statusCode).json(err.serializedErrors());
    }
    next();
  });
};

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = new http.Server(app);
    logger.info(`Authentication Service started with PID ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      logger.info(`Authentication Server started on port ${SERVER_PORT}`);
    });
  } catch (error) {
    logger.log('error', 'Authentication Service - call: startServer()', error);
  }
};
