import { Level, winstonLogger } from '@mohamedramadan14/freelance-shared';
import { Logger } from 'winston';
import { config } from '@authentication/config';
import { Sequelize } from 'sequelize';

const logger: Logger = winstonLogger(`${config.ELASTICSEARCH_URL}`, 'Authentication Database Server', Level.debug);

export const sequelize: Sequelize = new Sequelize(process.env.MYSQL_DATABASE!, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    multipleStatements: true
  }
});

export const databaseConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to Database Successfully....');
  } catch (error) {
    logger.error('Failed to connect to Database. Retrying.....');
    logger.log('error', 'Authentication Service - Failed to connect to Database. call: databaseConnection()', error);
  }
};
