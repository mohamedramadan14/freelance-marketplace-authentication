import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

dotenv.config({});

class Config {
  public GATEWAY_JWT_TOKEN: string | undefined;
  public JWT_TOKEN: string | undefined;
  public NODE_ENV: string | undefined;
  public API_GATEWAY_URL: string | undefined;
  public CLIENT_URL: string | undefined;
  public RABBITMQ_ENDPOINT: string | undefined;
  public MYSQL_DATABASE: string | undefined;
  public CLOUD_NAME: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRET: string | undefined;
  public ELASTICSEARCH_URL: string | undefined;
  public ELASTICSEARCH_APM_SERVER_URL: string | undefined;
  public ELASTICSEARCH_APM_SECRET_TOKEN: string | undefined;
  public ENABLE_APM: boolean | undefined;

  constructor() {
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || '';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.API_GATEWAY_URL = process.env.API_GATEWAY_BASE_URL || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || '';
    this.MYSQL_DATABASE = process.env.MYSQL_DATABASE || '';
    this.CLOUD_NAME = process.env.CLOUD_NAME || '';
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || '';
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || '';
    this.ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || '';
    this.ELASTICSEARCH_APM_SERVER_URL = process.env.ELASTICSEARCH_APM_SERVER_URL || '';
    this.ELASTICSEARCH_APM_SECRET_TOKEN = process.env.ELASTICSEARCH_APM_SECRET_TOKEN || '';
    this.ENABLE_APM = process.env.ENABLE_APM === 'true' || false;
  }

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: 'dqlyor5ee',
      api_key: '147454977495589',
      api_secret: 'uqPvy9ipRNLOwXVLuA2ljetz5WM'
    });
  }
}

export const config: Config = new Config();
