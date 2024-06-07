import { DataSource } from '@rgbpp-sdk/btc'
import { BtcAssetsApi } from '@rgbpp-sdk/service'
import { BTC_SERVICE_URL, BTC_SERVER_TOKEN } from '../env'
export { sendBtc } from '@rgbpp-sdk/btc'

export const btcService = BtcAssetsApi.fromToken(
  BTC_SERVICE_URL,
  BTC_SERVER_TOKEN
)

export const btcDataSource = new DataSource(btcService, 1)
