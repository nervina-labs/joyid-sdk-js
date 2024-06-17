export class GenericError extends Error {
  constructor(
    public error: string,
    public error_description: string
  ) {
    super(error_description)
    Object.setPrototypeOf(this, GenericError.prototype)
  }
}

export class TimeoutError extends GenericError {
  constructor() {
    super('timeout', 'Timeout')
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, TimeoutError.prototype)
  }
}

/**
 * Error thrown when the login popup times out (if the user does not complete auth)
 */
export class PopupTimeoutError extends TimeoutError {
  constructor(public popup: Window) {
    super()
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, PopupTimeoutError.prototype)
  }
}

export class PopupCancelledError extends GenericError {
  constructor(public popup?: Window) {
    super('cancelled', 'Popup closed')
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, PopupCancelledError.prototype)
  }
}

export class PopupNotSupportedError extends GenericError {
  constructor(public popup: Window) {
    super(
      'NotSupported',
      'Popup window is blocked by browser. see: https://docs.joy.id/guide/best-practice#popup-window-blocked'
    )
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, PopupCancelledError.prototype)
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
