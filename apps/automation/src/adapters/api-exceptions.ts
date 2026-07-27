import { AutomationException } from '../core/domain/exceptions';

export class ApiException extends AutomationException {
  constructor(
    public readonly statusCode: number,
    message: string,
    details?: unknown,
  ) {
    super('API_ERROR', message, details);
  }
}

export class UnauthorizedException extends ApiException {
  constructor(message = 'API authentication failed') {
    super(401, message);
  }
}

export class ForbiddenException extends ApiException {
  constructor(message = 'API access forbidden') {
    super(403, message);
  }
}

export class NotFoundException extends ApiException {
  constructor(message = 'API resource not found') {
    super(404, message);
  }
}

export class ConflictException extends ApiException {
  constructor(message = 'API resource conflict') {
    super(409, message);
  }
}

export class NetworkException extends ApiException {
  constructor(message = 'Network error', cause?: Error) {
    super(0, message, { cause: cause?.message });
  }
}

export class InvalidResponseException extends ApiException {
  constructor(message = 'Invalid API response', errors?: unknown[]) {
    super(502, message, errors);
  }
}
