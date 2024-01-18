export const ENV_VARS = {
  load: () => {
    const missing = Object.keys(ENV_VARS).filter((key) => {
      if (key == 'load') {
        return false;
      }

      ENV_VARS[key] = process.env[key];

      if (!ENV_VARS[key]) {
        return true;
      }
    });
    if (missing.length > 0) {
      console.error(`ENVIRONMENT VARIABLES NOT INFORMED: ${missing.join(', ')}`);
      return false;
    }
    return true;
  },
  MONGO_TOKEN: '',
  QIL_TOKEN: '',
  QIL_BASE_URL: '',
  PLACE_ID: '',
  CATEGORY_ID_DEFAULT: '',
  FEATURE_FLAG_REGISTERED_PRODUCTS: '',
  ENVIRONMENT: ''
};

export const QUERO_DOMAIN = {
  PRODUCT_STATUS: {
    ACTIVE: 'ATIVO',
    MISSING: 'EM_FALTA',
    HIDDEN: 'OCULTO'
  }
};

export const  MONGO_DOMAIN = {
  DATE_FORMAT: 'YYYY-MM-DDTHH:mm:ss.0300Z',
  LIMIT: 100,
  LIMITORDER:2
};


export const  PRODUTO_NOT_ATT = ['1234','10014687'];