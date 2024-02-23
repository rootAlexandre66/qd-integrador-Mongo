import dotenv from 'dotenv';
dotenv.config();
import { ENV_VARS, MONGO_DOMAIN } from './constants';
ENV_VARS.load();

import { writeLastSync, readLastSync } from './services/filesystem.service';
import {  getLogger } from 'log4js';
import { PATHS } from './path-config';
import moment from 'moment';
import fs from 'fs';
import * as path from 'path';

import {  isDawn, removeLogsOlderThanFiveDays } from './util';


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

  try{
  //  await getProductChanged(String(lastSyncDate), currentSyncDate);
  // Exemplo de uso


  const productInfos = readAndProcessLogs('/Users/alexandresouzaadm/Documents/Projetos/qd-integrador-Mongo /logs/2024-02-23.log');

  // Exibir as informações do produto
  productInfos.forEach((productInfo) => {
  });

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
// Função para processar logs e extrair informações do produto
function processLogs(logs: string[]): ProductInfo[] {
  const productInfos: ProductInfo[] = [];
  const occurrences: { [key: string]: number } = {};

  for (const log of logs) {
    if (log.includes('[INFO] APP - TR CODIGOBARRAS:')) {
      const match = log.match(/\[INFO\] APP - TR CODIGOBARRAS:(.+) - DESCRICAO:(.+) - R\$ (.+) - PREÇO C\/ DESCONTO:/);

      if (match && match.length === 4) {
        const [codigoBarras, descricao, preco] = match;

        // Contabilizar ocorrências do código de barras
        occurrences[codigoBarras.trim()] = (occurrences[codigoBarras.trim()] || 0) + 1;

        const productInfo: ProductInfo = {
          codigoBarras: codigoBarras.trim(),
          descricao: descricao.trim(),
          preco: parseFloat(preco.trim()),
        };
        productInfos.push(productInfo);
      }
    }
  }

  // Log de ocorrências
  console.log('Ocorrências de código de barras:');
  for (const codigoBarras in occurrences) {
    console.log(`${codigoBarras}: ${occurrences[codigoBarras]}`);
  }

  return productInfos;
}

// Função para ler arquivos de log e chamar a função de processamento
function readAndProcessLogs(filePath: string): ProductInfo[] {
  try {
    const logs = fs.readFileSync(filePath, 'utf-8').split('\n');
    return processLogs(logs);
  } catch (error) {
    console.error(`Erro ao ler o arquivo ${filePath}: ${error.message}`);
    return [];
  }
}

// Definir a interface para as informações do produto
interface ProductInfo {
  codigoBarras: string;
  descricao: string;
  preco: number;
}
