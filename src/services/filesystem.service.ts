import fs from 'fs';
import moment from 'moment';
import { PATHS } from '../path-config';
import { getLogger } from 'log4js';

const logger = getLogger('FILE_SYSTEM');

export const writeLastSync = (date: string) => {
  return new Promise((res, rej) => {
    fs.writeFile(`${PATHS.READ_WRITE_LASTSYNC}`, date.toString(), (err) => {
      if (err) {
        logger.fatal(err);

        rej(false);
        return null;
      }

      res(true);
      return null;
    });
  });
};

export const readLastSync = () => {
  return new Promise((res, rej) => {
    fs.readFile(`${PATHS.READ_WRITE_LASTSYNC}`, (err, data) => {
      if (err) {
        rej(false);
        logger.fatal(err);

        return null;
      }

      res(data.toString());
      return null;
    });
  });
};

export const saveProductsNotFound = (product: string) => {
  const now = moment().format('YYYY-MM-DD');
  fs.appendFile(`${PATHS.SAVE_PRODUCTS_NOT_FOUND}${now}.log`, product, (err) => {
    if (err) {
      logger.fatal(err);
      return null;
    }

    return null;
  });
};
export const saveOrderExported = (order: string) => {
  const now = moment().format('YYYY-MM-DD');
  fs.appendFile(`${PATHS.SAVE_ORDER_EXPORTED}${now}.log`, order, (err) => {
    if (err) {
      logger.fatal(err);
      return null;
    }

    return null;
  });
};
export const readDirLogsSync = () => {
  return new Promise((res, rej) => {
    fs.readdir(`${PATHS.CONFIGURE_LOG}`, (err, files) => {
      if (err) {
        rej(false);
        logger.fatal(err);

        return null;
      }

      res(files[0]);
      return null;
    });
  });
};

export const deleteLogSync = (logPath: string) => {
  return new Promise((res, rej) => {
    fs.unlink(`${logPath}`, (err) => {
      if (err) {
        rej(false);
        logger.fatal(err);

        return null;
      }

      res(true);
      return null;
    });
  });
};
