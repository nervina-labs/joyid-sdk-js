/** @deprecated Use numbers instead. */
/* eslint-disable no-unused-vars */
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
  RelayList = 10002,
  ClientAuth = 22242,
  HttpAuth = 27235,
  ProfileBadge = 30008,
  BadgeDefinition = 30009,
  Article = 30023,
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
