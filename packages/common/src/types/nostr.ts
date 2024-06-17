import {
  type DappRequestType,
  type DappResponse,
  type JoyIDConfig,
} from './dapp'
import { type RequireExactlyOne } from 'type-fest'

/** @deprecated Use numbers instead. */

export enum EventKind {
  Metadata = 0,
  Text = 1,
  RecommendRelay = 2,
  Contacts = 3,
  EncryptedDirectMessage = 4,
  EventDeletion = 5,
  Repost = 6,
  Reaction = 7,
  BadgeAward = 8,
  ChannelCreation = 40,
  ChannelMetadata = 41,
  ChannelMessage = 42,
  ChannelHideMessage = 43,
  ChannelMuteUser = 44,
  Blank = 255,
  Report = 1984,
  ZapRequest = 9734,
  Zap = 9735,
  RelayList = 10_002,
  ClientAuth = 22_242,
  HttpAuth = 27_235,
  ProfileBadge = 30_008,
  BadgeDefinition = 30_009,
  Article = 30_023,
}

export interface EventTemplate<K extends number = number> {
  kind: K
  tags: string[][]
  content: string
  created_at: number
}

export type UnsignedEvent<K extends number = number> = EventTemplate<K> & {
  pubkey: string
}

export type Event<K extends number = number> = UnsignedEvent<K> & {
  id: string
  sig: string
}

export interface GetPublicKeyRequest extends JoyIDConfig {
  redirectURL: string
  name?: string
  logo?: string
}

export interface SignNostrEventRequest extends GetPublicKeyRequest {
  event: UnsignedEvent<number>
}

export interface SignNostrEventData {
  event: Event<number>
}

export type SignNostrEventResponse = {
  type: DappRequestType.SignNostrEvent
} & RequireExactlyOne<DappResponse<SignNostrEventData>, 'data' | 'error'>
