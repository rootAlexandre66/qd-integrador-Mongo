import Axios from 'axios';

import { ENV_VARS } from '../constants';
import { handleError } from '../util';
import { stringify } from 'query-string';
import { env } from 'process';
import { IOrder } from 'interfaces/quero.interface';
import { IorderP } from 'interfaces/mongo.interface';


const SERVICE_NAME = 'MongoService';

const axios = Axios.create({
  baseURL:process.env.mongo_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'eyJwbGFjZUlkIjoiNjU2NzIzNjE4ZjYzN2JlM2QyYzI4NzlmIiwibm9tZVNpc3RlbWEiOiJpbm92YSJ9',  // Substitua com o seu token, se necessário
    // Outros headers comuns podem ser adicionados aqui
  },

});
const tokenQil = process.env.QIL_TOKEN
const placeId = process.env.PLACE_ID;
const instancia = Axios.create({
    baseURL:process.env.QIL_BASE_URL,
    headers:  {Authorization :tokenQil},
   
})
export class mongoService {
  static async testServer (){
    let path = '/home'
    try{
      const response = await axios.get(path);

      return response.data
    }catch(error){
      console.log('Error ao testar o servidor ')
    }
  }
  static async  getChangedProduct(startDate: string, endDate: string, offset: number, limit: number) {
    
    let path = `/allProdutosForData/${process.env.mongo_TOKEN}`
    try {
      const response = await axios.get(`${path}?dataInicial=${startDate}&dataFinal=${endDate}&offset=${offset}&limit=${limit}`);

      const {data } = response;
      return data;
    } catch (error) {
      return handleError(error, SERVICE_NAME, 'getPriceChanged');
    }
  }
  static async  getChangedProducts(startDate: string, endDate: string, offset: number, limit: number) {
    
    let path = `/allProdutos`
    try {
      //const response = await axios.get(`${path}?dataInicial=${dataincial}&endDate=${endDate}&offset=${offset}&limit=${limit}`);
      const response = await axios.get(`${path}?startDate=${startDate}&endDate=${endDate}&offset=${offset}&limit=${limit}`);

      const {data } = response;
      return data;
    } catch (error) {
      return handleError(error, SERVICE_NAME, 'getPriceChanged');
    }
  }


  
}
