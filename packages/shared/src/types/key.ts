export type SessionKeyType = 'main_session_key' | 'sub_session_key'
export type WebauthnKeyType = 'main_key' | 'sub_key'
export type CredentialKeyType = SessionKeyType | WebauthnKeyType

export enum SigningAlg {
  RS256 = -257,
  ES256 = -7,
}
