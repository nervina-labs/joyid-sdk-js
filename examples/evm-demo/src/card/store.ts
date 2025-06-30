import { Params } from '@solidjs/router'
import { createSignal, Signal } from 'solid-js'

function createStoredSignal(
  key: string,
  defaultValue: string,
  storage = window.localStorage
): Signal<string> {
  const initialValue = storage.getItem(key) || defaultValue

  const [val, setVal] = createSignal(initialValue)

  const setValueAndStore = ((arg) => {
    const v = setVal(arg)
    storage.setItem(key, v)
    return v
  }) as typeof setVal

  return [val, setValueAndStore]
}

export function updateCardIdAndCampaignFromUrl(searchParams: Params) {
  const marker = searchParams.campaign
  const cardId = searchParams.card_id
  if (marker) {
    setCampaign(marker)
  }

  if (cardId) {
    setCardId(cardId)
  }
}

export const [cardId, setCardId] = createStoredSignal('card_id', '')
export const [campaign, setCampaign] = createStoredSignal('campaign', '')
