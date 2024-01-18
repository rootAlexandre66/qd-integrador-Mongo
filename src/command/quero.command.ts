import { QueroService } from '../services/quero.service';
import { getLogger } from 'log4js';
import { formatNumberDecimalPlaces, formatProductObjectToString } from '../util';
import {
  IParamsFilters,
  IParamsRegisterProduct,
  IParamsUpdatePrice,
  IParamsUpdateProduct,
  IProduct
} from '../interfaces/quero.interface';

const logger = getLogger('QD COMMAND');

export class QueroCommand {
  static getProduct = async (filtersParams: IParamsFilters): Promise<IProduct | false> => {
    const product = await QueroService.getProduct(filtersParams);

    if (!product || !product.r || product.error || product.data.produtos) {
      return false;
    }

    const { data } = product;

    const productResponse = {
      idQD: data._id,
      internalCodeQD: data.codigoInterno ? data.codigoInterno : '',
      barcodeQD: data.codigoBarras ? data.codigoBarras : '',
      nameQD: data.nome,
      priceQD: formatNumberDecimalPlaces(data.preco),
      statusQD: data.status,
      isControlStockQD: data.controlaEstoque,
      qtdStockQD: data.qtdEstoque
    };

    return productResponse;
  };

  static updatePriceProduct = async (updatePriceParams: IParamsUpdatePrice) => {
    const { barcode, internalCode, currentPrice, oldPrice, isPromotion } = updatePriceParams;

    const response = await QueroService.updatePriceProduct(updatePriceParams);

    if (response.r === true) {
      if (isPromotion) {
        logger.info(`price in quero UPDATED SUCCESS | ${oldPrice} -> ${currentPrice} PROMOCAO`);
      } else {
        logger.info(`price in quero UPDATED SUCCESS | ${currentPrice}`);
      }
    } else {
      logger.fatal(`price in quero UPDATED FAIL $${barcode} - ${internalCode} - ${currentPrice}`);
    }
  };

  static updateStockProduct = async (filtersParams: IParamsFilters, quantity: number) => {
    const { barcode, internalCode } = filtersParams;

    const response = await QueroService.updateStockProduct(filtersParams, quantity);

    if (response.r === true) {
      logger.info(`stock in quero UPDATED SUCCESS | -> ${quantity}`);
    } else {
      logger.fatal(`stock in quero UPDATED FAIL $${barcode} - ${internalCode} - ${quantity}`);
    }
  };

  static updateControlStock = async (filtersParams: IParamsFilters, stockControl: boolean) => {
    const { barcode, internalCode } = filtersParams;

    const response = await QueroService.updateControlStock(filtersParams, stockControl);

    if (response.r === true) {
      logger.info(`control of stock in quero UPDATED SUCCESS | -> ${stockControl}`);
    } else {
      logger.fatal(`control of stock in quero UPDATED FAIL $${barcode} - ${internalCode} - ${stockControl}`);
    }
  };

  static updateInternalCode = async (barcode: string, newInternalCode: string) => {
    const response = await QueroService.updateInternalCode(barcode, newInternalCode);

    if (response.r === true) {
      logger.info(`internal code in quero UPDATED SUCCESS | -> ${newInternalCode}`);
    } else {
      logger.fatal(`internal code in quero UPDATED FAIL $${barcode} - ${newInternalCode}`);
    }
  };

  static updateStatusProduct = async (filtersParams: IParamsFilters, status: string) => {
    const { barcode, internalCode } = filtersParams;

    const response = await QueroService.updateStatusProduct(filtersParams, status);

    if (response.r === true) {
      logger.info(`status in quero UPDATED SUCCESS | -> ${status}`);
    } else {
      logger.fatal(`status in quero UPDATED FAIL ${barcode} - ${internalCode} - ${status}`);
    }
  };

  static updateProduct = async (productId: string, product: IParamsUpdateProduct) => {
    const response = await QueroService.updateProduct(productId, product);

    const infoProduct = formatProductObjectToString(product);

    if (response.r === true) {
      logger.info(`product in quero UPDATED SUCCESS | -> ${infoProduct}`);
    } else {
      logger.fatal(`failure to UPDATE the product with id: ${productId} | ${JSON.stringify(response.errors[0])}`);
    }
  };

  static saveProduct = async (product: IParamsRegisterProduct) => {
    const response = await QueroService.saveProduct(product);

    const { nome, codigoBarras, preco } = product;

    const infoProductQD = `CODIGOBARRAS: ${codigoBarras} - PRODUTO: ${nome} - R$ ${preco}`;

    if (response.r === true) {
      logger.info(`product REGISTERED SUCCESS | -> ${infoProductQD}`);
    } else {
      logger.fatal(
        `failure to REGISTER the product with barcode: ${codigoBarras} | ${JSON.stringify(response.errors[0])}`
      );
    }
  };
}
