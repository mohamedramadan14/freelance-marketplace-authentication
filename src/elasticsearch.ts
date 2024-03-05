import { Level, winstonLogger } from '@mohamedramadan14/freelance-shared';
import { Logger } from 'winston';
import { config } from '@authentication/config';
import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';

const logger: Logger = winstonLogger(`${config.ELASTICSEARCH_URL}`, 'Authentication ElasticSearch', Level.debug);

export const elasticsearchClient = new Client({
  node: config.ELASTICSEARCH_URL
});

export const createConnection = async (): Promise<void> => {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticsearchClient.cluster.health({});
      logger.info(`Authentication Service - Connected to ElasticSearch is ${health.status}`);
      isConnected = true;
    } catch (error) {
      logger.error('Failed to connect to ElasticSearch. Retrying.....');
      logger.log('error', 'Authentication Service - Failed to connect to ElasticSearch. call: createConnection()', error);
    }
  }
};
