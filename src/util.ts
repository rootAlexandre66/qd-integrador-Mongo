import { IParamsUpdateProduct } from './interfaces/quero.interface';
import { deleteLogSync, readDirLogsSync } from './services/filesystem.service';
import { PATHS } from './path-config';
import { getLogger } from 'log4js';

const logger = getLogger('HANDLE_ERROR');

export const handleError = (ex: any, serviceName: string, method: string) => {
  const objectError: any = {
    serviceName,
    method
  };

  if (ex.message) {
    objectError.message = ex.message;
  }

  if (ex.statusCode) {
    objectError.statusCode = ex.statusCode;
  }

  if (ex.status) {
    objectError.status = ex.status;
  }

  if (ex.response) {
    objectError.response = ex.response;
  }

  if (ex.request) {
    objectError.request = ex.request;
  }

  if (ex.code) {
    objectError.code = ex.code;
  }

  if (ex.stack) {
    objectError.stack = ex.stack;
  }

  if (ex.config) {
    objectError.config = ex.config;
  }

  logger.fatal(objectError);

  return { error: true };
};

export const asyncForEach = async (array: any, callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index]);
  }
};

export const formatNumberDecimalPlaces = (price: number, decimalPlaces = 2): number => {
  if (!price) {
    return 0;
  }

  if (price === 0 || Number.isInteger(price)) {
    return price;
  }

  const [integerPart, decimalPart] = price.toString().split('.');
  const priceRound = parseFloat(`${integerPart}.${decimalPart.substring(0, decimalPlaces)}`);
  return priceRound;
};

export const checkPromotion = (offerEndDate: string, priceOffer: number): boolean => {
  if (!offerEndDate || !priceOffer || priceOffer <= 0) {
    return false;
  }
  return new Date(offerEndDate) > new Date();
};

export const formatProductObjectToString = (product: IParamsUpdateProduct): string => {
  const keys = Object.keys(product);
  const values = Object.values(product);
  let infoProduct = '';

  for (let i = 0; i < keys.length; i++) {
    infoProduct += `${keys[i].toUpperCase()}: ${values[i]} - `;
  }

  return infoProduct;
};

export const isDawn = (lastSyncDate: string): boolean => {
  const lastSyncTime = Number(lastSyncDate.slice(11, 13));
  return lastSyncTime >= 1 && lastSyncTime <= 5;
};

export const removeLogsOlderThanFiveDays = async () => {
  const logs = (await readDirLogsSync()) as string[];

  const sortedLogs = logs.sort();

  while (sortedLogs.length > 5) {
    await deleteLogSync(`${PATHS.CONFIGURE_LOG}/${sortedLogs[0]}`);
    sortedLogs.shift();
  }
};
