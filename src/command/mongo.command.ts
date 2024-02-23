import { mongoService } from '../services/mongo.service';
import { formatNumberDecimalPlaces, handleError } from '../util';
import { IIdentifierChangedResult, IProductChangedResult, IStockChangedResult, IorderP } from '../interfaces/mongo.interface';
import {produtos} from '../produtos.json'
export class MongoCommand {


  static async testeServer ():Promise<false| any>{
  let result = await mongoService.testServer();

  return result
  }
  static getChangedProducts = async (
//    dataincial: string, endDate: string, offset: number, limit: number
  ): Promise<IProductChangedResult[] | boolean> => {
    //const priceChanged = await mongoService.getChangedProducts(dataincial, endDate, offset, limit);
    const productsChangedFormated = produtos.map(({codInterno,codBarras,nome,preco}) => {
        return {
          internalCodePR: String(codInterno),
          barcodePR: String(codBarras),
          namePR: String(nome),
          pricePR: formatNumberDecimalPlaces(preco),
        };
      }
    );

    return productsChangedFormated;
  };
  static getOrdersById = async (): Promise<IorderP[] | boolean> => {
    const orderChanged = []

    if (!orderChanged || !Array.isArray(orderChanged)) {
      return false;
    }
    const ordersChangedFormated = orderChanged.map((order) => {
     let itemsf =  order.items.map((item) => ({...item}))
      return {
        idusuario: String(order.displayId),
        valor: Number(order.total.itemsPrice.value),
        statusPedido:String(order.displayId),
        infoProducts: itemsf.map((item)=>{return `${item.name} \n`})
      };
    });


    return ordersChangedFormated;
  };
  

}

