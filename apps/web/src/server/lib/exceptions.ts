export class HttpException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: unknown[],
  ) {
    super(message);
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}

export class ValidationException extends HttpException {
  constructor(message = 'Validation failed', errors?: unknown[]) {
    super(400, message, errors);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class ConflictException extends HttpException {
  constructor(message = 'Resource already exists') {
    super(409, message);
  }
}

export class InternalServerException extends HttpException {
  constructor(message = 'Internal server error') {
    super(500, message);
  }
}
