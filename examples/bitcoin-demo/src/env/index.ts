export const JOY_ID_URL: string =
  import.meta.env.VITE_APP_JOY_ID_URL ??
  'https://joyid-app-git-btc-nervina.vercel.app'

export const BTC_SERVICE_URL: string =
  import.meta.env.VITE_APP_BTC_SERVICE_URL ??
  'https://btc-assets-api.testnet.mibao.pro'

export const BTC_SERVER_TOKEN: string =
  import.meta.env.VITE_APP_BTC_SERVER_TOKEN ?? ''

export const MIN_UTXO_AMOUNT = 10_000
