import { ISellerGig, Level, winstonLogger } from '@mohamedramadan14/freelance-shared';
import { Logger } from 'winston';
import { config } from '@authentication/config';
import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';

const logger: Logger = winstonLogger(`${config.ELASTICSEARCH_URL}`, 'Authentication ElasticSearch', Level.debug);

export const elasticsearchClient = new Client({
  node: config.ELASTICSEARCH_URL
});

export const createElasticsearchConnection = async (): Promise<void> => {
  let isConnected = false;

  while (!isConnected) {
    try {
      logger.log('info', 'Authentication Service - Creating connection to ElasticSearch...');
      const health: ClusterHealthResponse = await elasticsearchClient.cluster.health({});
      logger.info(`Authentication Service - Connected to ElasticSearch is ${health.status}`);
      isConnected = true;
    } catch (error) {
      logger.error('Failed to connect to ElasticSearch. Retrying.....');
      logger.log('error', 'Authentication Service - Failed to connect to ElasticSearch. call: createConnection()', error);
    }
  }
};

export const checkIsIndexExist = async (indexName: string): Promise<boolean> => {
  const res: boolean = await elasticsearchClient.indices.exists({
    index: indexName
  });

  return res;
};

export const createIndex = async (indexName: string): Promise<void> => {
  try {
    const isIndexExist: boolean = await checkIsIndexExist(indexName);
    if (isIndexExist) {
      logger.info(`Index : ${indexName} already exist.`);
    } else {
      await elasticsearchClient.indices.create({ index: indexName });
      // to make any document available for search immediately once index created
      await elasticsearchClient.indices.refresh({ index: indexName });
      logger.info(`Index : ${indexName} created successfully`);
    }
  } catch (error) {
    logger.error(`Failed to create index : ${indexName} in ElasticSearch.`);
    logger.log('error', `Authentication Service - Failed to create index : ${indexName} in ElasticSearch. call: createIndex()`, error);
  }
};

export const getDocumentById = async (index: string, documentId: string): Promise<ISellerGig> => {
  try {
    const res: GetResponse = await elasticsearchClient.get({ index, id: documentId });
    return res._source as ISellerGig;
  } catch (error) {
    logger.log('error', 'Authentication Service - call getDocumentById()', error);
    return {} as ISellerGig;
  }
};
