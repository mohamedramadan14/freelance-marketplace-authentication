import { config } from '@authentication/config';
import { createConnection } from '@authentication/queues/connection';
import { winstonLogger, Level } from '@mohamedramadan14/freelance-shared';
import { Channel } from 'amqplib';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTICSEARCH_URL}`, 'Authentication Queue Producer', Level.debug);

export const publishMessage = async (
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));
    logger.log('info', `Authentication Service - ${logMessage}`);
  } catch (error) {
    logger.log('error', 'Authentication Service - call: publishMessage()', error);
  }
};
