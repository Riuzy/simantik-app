export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: unknown[],
  ) {
    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad request', errors?: unknown[]) {
    super(400, message, errors);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Resource conflict') {
    super(409, message);
  }
}
