import dotenv from 'dotenv';
dotenv.config();
import { ENV_VARS, PRODUTO_NOT_ATT, QUERO_DOMAIN, MONGO_DOMAIN } from './constants';
ENV_VARS.load();

import { writeLastSync, readLastSync, saveProductsNotFound } from './services/filesystem.service';
import { configure, getLogger } from 'log4js';
import { PATHS } from './path-config';
import moment from 'moment';
import fs, { lstatSync } from 'fs';
import { MongoCommand } from './command/mongo.command';
import { QueroCommand } from './command/quero.command';
import { asyncForEach, isDawn, removeLogsOlderThanFiveDays } from './util';
import { IIdentifierChangedResult, IProductChangedResult, IStockChangedResult, IorderP } from './interfaces/mongo.interface';
import { IOrder, IParamsRegisterProduct, IParamsUpdateProduct, IProduct } from './interfaces/quero.interface';

const FEATURE_FLAG_REGISTERED_PRODUCTS = ENV_VARS.FEATURE_FLAG_REGISTERED_PRODUCTS === 'true';

let executions = 0;
let logger = getLogger('APP');

export const startApplication = async (): Promise<boolean> => {
  try {
    if (!ENV_VARS.load()) {
      console.error('APPLICATION CANNOT BE STARTED');
      return false;
    }

    if (!fs.existsSync(PATHS.SAVE_PRODUCTS_NOT_FOUND)) {
      fs.mkdirSync(PATHS.SAVE_PRODUCTS_NOT_FOUND);
    }

    const aDayAgo = moment().subtract(1, 'day').format(MONGO_DOMAIN.DATE_FORMAT);

    if (!fs.existsSync(PATHS.READ_WRITE_LASTSYNC)) {
      fs.writeFileSync(PATHS.READ_WRITE_LASTSYNC, aDayAgo);
    }

    await configureLogService();

    let lastSyncDate = (await readLastSync()) as string;

    if (isDawn(lastSyncDate)) {
      lastSyncDate = moment().subtract(3, 'day').format(MONGO_DOMAIN.DATE_FORMAT);
      await removeLogsOlderThanFiveDays();
    }

    const isValidLastSync = moment(lastSyncDate as string, MONGO_DOMAIN.DATE_FORMAT, true).isValid();

    if (!lastSyncDate || !isValidLastSync) {
      lastSyncDate = aDayAgo;
    }

    const currentSyncDate = moment().add(3, 'hours').format(MONGO_DOMAIN.DATE_FORMAT);
  //await getTestServer();
  try{
    await getProductChanged(String(lastSyncDate), currentSyncDate);

  }catch(error){

  }
    //inicializa busca por pedidos
   //await getOrders(String(lastSyncDate), currentSyncDate);
    
    const twoMinutesAgo = moment().subtract(1, 'minutes').format(MONGO_DOMAIN.DATE_FORMAT);

    await writeLastSync(twoMinutesAgo);

    logger.info('END\n');

    return true;
  } catch (ex) {
    logger.fatal(ex);

    return false;
  }
};
const getTestServer = async()=>{
let info = await MongoCommand.testeServer();
if(info){
  logger.info(info);

}else{
  logger.error(`${info}`);
}

}

const getProductChanged = async (startDate: string, endDate: string) => {
  logger.info(`searching for products with changes from ${startDate} at ${endDate}`);
  executions = 0;
  let offset = 0;
  let products: IProductChangedResult[] | boolean;
  let qtdProdutos = 0;
  do {
    try{
    products = await MongoCommand.getChangedProducts(startDate,endDate,offset,MONGO_DOMAIN.LIMIT);
    }catch(error){
      console.log(error)
    }
    if (!products || !Array.isArray(products)) {
      return;
    }
    qtdProdutos = products.length;
    if (qtdProdutos > 0) {
      logger.info(`${qtdProdutos} products were found in mongo`);

      await asyncForEach(products, async (product: IProductChangedResult) => {
        await processProduct(product, startDate);
      });
      offset += qtdProdutos;
    } else {
      logger.warn('no products changes found in mongo');
    }
  } while (qtdProdutos >= MONGO_DOMAIN.LIMIT);
};//busca as Orders

const processProductIdentifier = async (product: IIdentifierChangedResult) => {
  executions++;

  const { internalCodePR, barcodePR } = product;

  const productInfoTR = `TR CODIGOBARRAS: ${barcodePR} - CÓDIGO INTERNO:${internalCodePR}`;

  const productQD = await QueroCommand.getProduct({
    barcode: barcodePR,
    internalCode: internalCodePR
  });

  console.log('\n');
  logger.info(`===================== processing identifier product ${executions} =====================`);
  logger.info(productInfoTR);

  if (productQD) {
    const { barcodeQD, internalCodeQD } = productQD;

    logger.info(`QD CODIGOBARRAS: ${barcodeQD} - CÓDIGO INTERNO:${internalCodeQD} `);

    if (internalCodePR !== internalCodeQD) {
      await QueroCommand.updateInternalCode(barcodePR, internalCodePR);
    } else {
      logger.warn(`internal code is equal ${internalCodePR}`);
    }
  } else {
    logger.error('product not found in quero');
    saveProductsNotFound(`CÓDIGO INTERNO ALTERADO ~~> ${productInfoTR} \n`);
  }

  return true;
};

const processProduct = async (product: IProductChangedResult, lastSyncDate:string) => {
  executions++;

  const {
    internalCodePR,
    barcodePR,
    namePR,
    pricePR,
    discountPricePR,
    qtdStockPR,
    isActivePR
  } = product;

  const productInfoTR = `TR CODIGOBARRAS: ${barcodePR} - DESCRICAO:${namePR} - R$ ${pricePR} - PREÇO C/ DESCONTO: R$ ${discountPricePR} - ESTOQUE: ${qtdStockPR}`;

  console.log('\n');
  logger.info(`===================== processing product ${executions} =====================`);
  logger.info(productInfoTR);
//////////////////////////////////////////////////////////////////////////////////////

  let productQD: IProduct | false;
  try {
    productQD = await QueroCommand.getProduct({
      barcode: barcodePR,
      internalCode: internalCodePR
    });
  } catch (error) {
    logger.fatal('Get product fails.');
  }

  const changesProduct: IParamsUpdateProduct = {};

  if (productQD) {
    const { idQD, nameQD, barcodeQD, priceQD, internalCodeQD, qtdStockQD, isControlStockQD, statusQD } = productQD;
    logger.info(`QD CODIGOBARRAS: ${barcodeQD} - DESCRICAO:${nameQD} - R$ ${priceQD} - ESTOQUE: ${qtdStockQD}`);

    const listitens = process.env.PRODUCTSTHATSNOTTOBEACTIVE.split(",").includes(internalCodeQD);
    if(!listitens){
      if (internalCodePR !== internalCodeQD) {
        changesProduct.novoCodigoInterno = internalCodePR;
      } else {
        logger.warn(`internal code is equal ${internalCodePR}`);
      }
  
      if (discountPricePR > 0 && discountPricePR !== priceQD) {
        Object.assign(changesProduct, {
          preco: discountPricePR,
          precoAntigo: pricePR,
          isPromocao: true
        });
      } else if (discountPricePR <= 0 && pricePR > 0 && pricePR !== priceQD) {
        Object.assign(changesProduct, {
          preco: pricePR,
          precoAntigo: pricePR < priceQD ? priceQD : 0,
          isPromocao: false
        });
      } else {
        logger.warn('price in quero EQUAL');
      }
    }else{
      console.log(" item nåo atualizavel")
    }
    if (internalCodePR !== internalCodeQD) {
      changesProduct.novoCodigoInterno = internalCodePR;
    } else {
      logger.warn(`internal code is equal ${internalCodePR}`);
    }

    if (discountPricePR > 0 && discountPricePR !== priceQD) {
      Object.assign(changesProduct, {
        preco: discountPricePR,
        precoAntigo: pricePR,
        isPromocao: true
      });
    } else if (discountPricePR <= 0 && pricePR > 0 && pricePR !== priceQD) {
      Object.assign(changesProduct, {
        preco: pricePR,
        precoAntigo: pricePR < priceQD ? priceQD : 0,
        isPromocao: false
      });
    } else {
      logger.warn('price in quero EQUAL');
    }
    const produtonotatt= PRODUTO_NOT_ATT.includes(internalCodeQD);

    if (produtonotatt) {
      changesProduct.controlaEstoque = false;
    } 
    if (!isControlStockQD && !produtonotatt) {
      changesProduct.controlaEstoque = true;
    } else {
      logger.warn('control of stock is equal ATIVO');
    }

    if (qtdStockPR !== qtdStockQD) {
      changesProduct.quantidade = qtdStockPR;
    } else {
      logger.warn('stock in quero EQUAL');
    }

    if (!isActivePR && statusQD !== QUERO_DOMAIN.PRODUCT_STATUS.HIDDEN) {
      changesProduct.status = QUERO_DOMAIN.PRODUCT_STATUS.HIDDEN;
    } else if (isActivePR && qtdStockPR > 0 && statusQD !== QUERO_DOMAIN.PRODUCT_STATUS.ACTIVE) {
      changesProduct.status = QUERO_DOMAIN.PRODUCT_STATUS.ACTIVE;
    } else if (isActivePR && qtdStockPR <= 0 && statusQD !== QUERO_DOMAIN.PRODUCT_STATUS.MISSING) {
      changesProduct.status = QUERO_DOMAIN.PRODUCT_STATUS.MISSING;
    } else {
      logger.warn('status is equal');
    }

    if (Object.keys(changesProduct).length) {
      try {
        await QueroCommand.updateProduct(idQD, changesProduct);
      } catch (error) {
        logger.fatal('Update product fails.');
      }
    }
  } else {
    if (FEATURE_FLAG_REGISTERED_PRODUCTS) {
      const newProductQD = generateProductEntity(product);
      try {
        await QueroCommand.saveProduct(newProductQD);
      } catch (error) {
        logger.fatal('Save product fails.');
      }
      return;
    }

    logger.error('product not found in quero');
    saveProductsNotFound(`PREÇO ALTERADO ~~> ${productInfoTR} \n`);
  }

  return true;
};

const processProductStock = async (product: IStockChangedResult) => {
  executions++;
  const { internalCodePR, qtdStockPR } = product;

  const productInfoTR = `TR CODIGO INTERNO: ${internalCodePR} - ESTOQUE: ${qtdStockPR}`;

  let productQD: IProduct | false;
  try {
    productQD = await QueroCommand.getProduct({
      barcode: undefined,
      internalCode: internalCodePR
    });
  } catch (error) {
    logger.fatal('Get product fails.');
  }

  console.log('\n');
  logger.info(`===================== processing stock product ${executions} =====================`);
  logger.info(productInfoTR);

  const changesProduct: IParamsUpdateProduct = {};

  if (productQD) {
    const { idQD, statusQD, isControlStockQD, qtdStockQD, internalCodeQD } = productQD;
    logger.info(`QD CODIGO INTERNO: ${internalCodePR} - ESTOQUE: ${qtdStockQD}`);

    if (internalCodePR !== internalCodeQD) {
      changesProduct.novoCodigoInterno = internalCodePR;
    } else {
      logger.warn(`internal code is equal ${internalCodePR}`);
    }

    if (isControlStockQD !== true) {
      changesProduct.controlaEstoque = true;
    } else {
      logger.warn('control of stock is equal ATIVO');
    }

    if (qtdStockPR !== qtdStockQD) {
      changesProduct.quantidade = qtdStockPR;
    } else {
      logger.warn('stock in quero EQUAL');
    }

    if (qtdStockPR > 0 && statusQD !== QUERO_DOMAIN.PRODUCT_STATUS.ACTIVE) {
      changesProduct.status = QUERO_DOMAIN.PRODUCT_STATUS.ACTIVE;
    } else if (qtdStockPR <= 0 && statusQD !== QUERO_DOMAIN.PRODUCT_STATUS.MISSING) {
      changesProduct.status = QUERO_DOMAIN.PRODUCT_STATUS.MISSING;
    } else {
      logger.warn('status is equal');
    }

    if (Object.keys(changesProduct).length) {
      try {
        await QueroCommand.updateProduct(idQD, changesProduct);
      } catch (error) {
        logger.fatal('Update product fails.');
      }
    }
  } else {
    logger.error('product not found in quero');
    saveProductsNotFound(`ESTOQUE ALTERADO ~~> ${productInfoTR} \n`);
  }

  return true;
};

function generateProductEntity(product: IProductChangedResult): IParamsRegisterProduct {
  const { namePR: nome, pricePR, barcodePR: codigoBarras, internalCodePR: codigoInterno, discountPricePR } = product;

  const isPromotionTR = discountPricePR > 0;

  return {
    nome,
    categoriaId: ENV_VARS.CATEGORY_ID_DEFAULT,
    status: QUERO_DOMAIN.PRODUCT_STATUS.HIDDEN,
    preco: isPromotionTR ? discountPricePR : pricePR,
    precoAntigo: isPromotionTR ? pricePR : 0,
    codigoBarras,
    codigoInterno,
    isPesavel: false,
    isPromocao: isPromotionTR,
    isSazonal: false
  };
}

const configureLogService = async () => {
  return new Promise((res) => {
    configure({
      appenders: {
        logger: {
          type: 'file',
          filename: `${PATHS.CONFIGURE_LOG}${moment().format('YYYY-MM-DD')}.log`
        },
        console: {
          type: 'console'
        }
      },
      categories: {
        default: {
          appenders: ['logger', 'console'],
          level: 'info'
        }
      }
    });

    res(true);
  });
};
