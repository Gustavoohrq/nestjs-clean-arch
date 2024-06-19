
export class NotFoundErrorError extends Error {
  constructor(public message: string) {
    super(message)
    this.name = 'NotFoundErrorError'
  }
}
