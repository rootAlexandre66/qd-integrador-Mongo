import Axios from 'axios';
import { stringify } from 'query-string';
import { handleError } from '../util';
import { ENV_VARS } from '../constants';
import {
  IPayloadFilters,
  IParamsFilters,
  IParamsUpdatePrice,
  IParamsUpdateProduct,
  IParamsRegisterProduct
} from '../interfaces/quero.interface';

const TOKEN_QIL = `Basic ${ENV_VARS.QIL_TOKEN}`;
const PLACE_ID = ENV_VARS.PLACE_ID;
const BASE_URL_QIL = ENV_VARS.QIL_BASE_URL;
const SERVICE_NAME = 'QueroService';

const instance = Axios.create({
  baseURL: BASE_URL_QIL,
  headers: {
    Authorization: TOKEN_QIL,
    'User-Agent': 'qd-integrador-trier'
  }
});

export class QueroService {
  static getProduct = async (filtersParams: IParamsFilters) => {
    try {
      const { barcode, internalCode } = filtersParams;

      if (barcode === 'null') {
        return;
      }

      const payload = generateRequestPayload(barcode, internalCode, PLACE_ID);

      const filter = stringify(payload);

      const response = await instance.get(`produto?${filter}`);

      const { data } = response;

      return data;
    } catch (error) {
      return handleError(error, SERVICE_NAME, 'getProduct');
    }
  };

  static updatePriceProduct = async (updatePriceParams: IParamsUpdatePrice) => {
    try {
      const { barcode, internalCode, currentPrice, oldPrice, isPromotion } = updatePriceParams;

      const payload = generateRequestPayload(barcode, internalCode, PLACE_ID);

      const filter = stringify(payload);

      const body = {
        preco: currentPrice,
        precoAntigo: oldPrice,
        isPromocao: isPromotion
      };

      const response = await instance.put(`produto/preco?${filter}`, body);

      const { data } = response;

      return data;
    } catch (error) {
      return handleError(error, SERVICE_NAME, 'updatePriceProduct');
    }
  };

  static updateStockProduct = async (filtersParams: IParamsFilters, quantity: number) => {
    try {
      const { barcode, internalCode } = filtersParams;

      const payload = generateRequestPayload(barcode, internalCode, PLACE_ID);

      const filter = stringify(payload);

      const body = {
        quantidade: quantity
      };

      const response = await instance.put(`produto/lancar-estoque?${filter}`, body);

      const { data } = response;

      return data;
    } catch (error) {
      return handleError(error, SERVICE_NAME, 'updateStockProduct');
    }
  };

  static updateControlStock = async (filtersParams: IParamsFilters, stockControl: boolean) => {
    try {
      const { barcode, internalCode } = filtersParams;

      const payload = generateRequestPayload(barcode, internalCode, PLACE_ID);

      const filter = stringify(payload);

      const body = {
        controlaEstoque: stockControl
      };

      const response = await instance.put(`produto/controla-estoque?${filter}`, body);

      const { data } = response;

      return data;
    } catch (error) {
      return handleError(error, SERVICE_NAME, 'updateControlStock');
    }
  };

  static updateInternalCode = async (barcode: string, newInternalCode: string) => {
    try {
      const payload = generateRequestPayload(barcode, newInternalCode, PLACE_ID);

      const filter = stringify(payload);

      const body = {
        novoCodigoInterno: newInternalCode
      };

      const response = await instance.put(`produto/codigo-interno?${filter}`, body);

      const { data } = response;

      return data;
    } catch (error) {
      return handleError(error, SERVICE_NAME, 'updateInternalCode');
    }
  };

  static updateStatusProduct = async (filtersParams: IParamsFilters, status: string) => {
    try {
      const { barcode, internalCode } = filtersParams;

      const payload = generateRequestPayload(barcode, internalCode, PLACE_ID);

      const filter = stringify(payload);

      const body = {
        status
      };

      const response = await instance.put(`produto/status?${filter}`, body);

      const { data } = response;

      return data;
    } catch (error) {
      return handleError(error, SERVICE_NAME, 'updateStatusProduct');
    }
  };

  static updateProduct = async (productId: string, product: IParamsUpdateProduct) => {
    try {
      const payload = {
        placeId: PLACE_ID,
        produtoId: productId
      };

      const filter = stringify(payload);

      const response = await instance.put(`produto?${filter}`, product);

      const { data } = response;

      return data;
    } catch (error) {
      return handleError(error, SERVICE_NAME, 'updateProduct');
    }
  };

  static saveProduct = async (product: IParamsRegisterProduct) => {
    try {
      const payload = {
        placeId: PLACE_ID
      };

      const filter = stringify(payload);

      const response = await instance.post(`produto?${filter}`, product);

      const { data } = response;

      return data;
    } catch (error) {
      return handleError(error, SERVICE_NAME, 'saveProduct');
    }
  };
}

const generateRequestPayload = (
  barcode: string | undefined,
  internalCode: string | undefined,
  placeId: string
): IPayloadFilters => {
  const payload: IPayloadFilters = {
    placeId
  };

  barcode ? (payload.codigoBarras = barcode) : (payload.codigoInterno = internalCode);

  return payload;
};
