export interface IProductChangedResult {
  internalCodePR: string;
  barcodePR: string;
  namePR: string;
  pricePR: number;

}

export interface IStockChangedResult {
  internalCodePR: string;
  qtdStockPR: number;
}

export interface IIdentifierChangedResult {
  internalCodePR: string;
  barcodePR: string;
}
export interface IorderP{
  idusuario: string,
  valor:number,
  statusPedido:string,
  infoProducts: []
}
