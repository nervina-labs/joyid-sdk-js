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
    if (message === DappErrorName.UserRejected) {
      this.name = message
    } else {
      this.name = name
    }
    this.rawError = rawError
  }
}

export class RedirectErrorWithState extends Error {
  constructor(
    public message: string,
    public state?: any
  ) {
    super(message)
    this.state = state
  }
}
