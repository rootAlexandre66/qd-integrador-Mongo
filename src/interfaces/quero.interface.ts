export interface IPayloadFilters {
  placeId: string;
  codigoBarras?: string;
  codigoInterno?: string;
}

export interface IParamsFilters {
  barcode?: string;
  internalCode?: string;
}

export interface IProduct {
  idQD: string;
  barcodeQD: string;
  internalCodeQD: string;
  nameQD: string;
  priceQD: number;
  statusQD: string;
  isControlStockQD: boolean;
  qtdStockQD: number;
}

export interface IParamsUpdatePrice {
  barcode: string | undefined;
  internalCode: string | undefined;
  currentPrice: number;
  oldPrice: number;
  isPromotion: boolean;
}

export interface IParamsUpdateProduct {
  nome?: string;
  descricao?: string;
  novoCodigoBarras?: string;
  novoCodigoInterno?: string;
  preco?: number;
  precoAntigo?: number;
  isPromocao?: boolean;
  quantidade?: number;
  controlaEstoque?: boolean;
  status?: string;
}

export interface IParamsRegisterProduct {
  nome: string;
  categoriaId: string;
  status: string;
  preco: number;
  precoAntigo: number;
  codigoBarras: string;
  codigoInterno: string;
  isPesavel: boolean;
  isPromocao: boolean;
  isSazonal: boolean;
}
export interface IOrder{
  idOrder: string;
  valorOrder: number;
  items:string[]
}