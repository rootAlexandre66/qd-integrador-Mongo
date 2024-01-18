import dotenv from 'dotenv';
dotenv.config();
import { ENV_VARS } from './constants';
ENV_VARS.load();

const ENVIRONMENT = ENV_VARS.ENVIRONMENT;

export const PATHS = {
  CONFIGURE_LOG: '',
  READ_WRITE_LASTSYNC: '',
  SAVE_PRODUCTS_NOT_FOUND: '',
  SAVE_ORDER_EXPORTED:''
};

ENVIRONMENT === 'DEV'
  ? ((PATHS.CONFIGURE_LOG = `${__dirname}/../logs/`),
    (PATHS.READ_WRITE_LASTSYNC = `${__dirname}/lastSync`),
    (PATHS.SAVE_PRODUCTS_NOT_FOUND = `${__dirname}/../products-not-found/`))
      : ((PATHS.CONFIGURE_LOG = 'logs/'),
    (PATHS.READ_WRITE_LASTSYNC = './lastSync'),
    (PATHS.SAVE_PRODUCTS_NOT_FOUND = 'products-not-found/'))
        ;
