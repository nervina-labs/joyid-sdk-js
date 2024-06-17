export enum DappErrorName {
  DecodeError = 'Decode Error',
  InvalidParams = 'Invalid Params',
  UserRejected = 'User Rejected',
  NotAllowed = 'Not Allowed',
}

export class DappError extends Error {
  rawError?: unknown

  constructor(
    message: string,
    name: string = DappErrorName.InvalidParams,
    rawError: unknown = undefined
  ) {
    super(message)
    this.name = message === DappErrorName.UserRejected ? message : name
    this.rawError = rawError
  }
}
