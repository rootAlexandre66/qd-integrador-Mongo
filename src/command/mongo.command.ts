import { mongoService } from '../services/mongo.service';
import { formatNumberDecimalPlaces, handleError } from '../util';
import { IIdentifierChangedResult, IProductChangedResult, IStockChangedResult, IorderP } from '../interfaces/mongo.interface';
import { IOrder } from 'interfaces/quero.interface';

export class MongoCommand {


  static async testeServer ():Promise<false| any>{
  let result = await mongoService.testServer();

  return result
  }
  static getChangedProducts = async (
    dataincial: string, endDate: string, offset: number, limit: number
  ): Promise<IProductChangedResult[] | boolean> => {
    const priceChanged = await mongoService.getChangedProducts(dataincial, endDate, offset, limit);

    if (priceChanged.error || !Array.isArray(priceChanged)) {
      return false;
    }

    const productsChangedFormated = priceChanged.map(
      ({
        codigoInterno,
        codigoBarras,
        nameProduto,
        price,
        promotionPrice,
        estoque,
        estatus,
        integracaoEcommerce
      }) => {
        return {
          internalCodePR: String(codigoInterno),
          barcodePR: String(codigoBarras),
          namePR: String(nameProduto),
          pricePR: formatNumberDecimalPlaces(price),
          discountPricePR: Number(promotionPrice) ,
          qtdStockPR: Number(estoque),
          isActivePR: Boolean(estatus),
          isIntegrationEcommercePR: Boolean(integracaoEcommerce)
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

