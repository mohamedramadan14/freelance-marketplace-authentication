import { config } from '@authentication/config';
import { Level, winstonLogger } from '@mohamedramadan14/freelance-shared';
import client, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTICSEARCH_URL}`, 'Authentication Queue Server', Level.debug);

const createConnection = async (): Promise<Channel | undefined> => {
  try {
    const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();
    logger.info('Authentication Service - Connected to RabbitMQ Successfully....');
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    logger.error('Authentication Service - Failed to connect to RabbitMQ. Retrying.....');
    logger.log('error', 'Authentication Service - Failed to connect to RabbitMQ. call: createConnection()', error);
    return undefined;
  }
};

const closeConnection = (channel: Channel, connection: Connection): void => {
  process.on('SIGINT', () => {
    connection.close();
    channel.close();
  });
};

export { createConnection };
