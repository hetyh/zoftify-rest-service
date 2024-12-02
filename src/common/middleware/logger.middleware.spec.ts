import { AppLoggerMiddleware } from './logger.middleware';
import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

describe('AppLoggerMiddleware', () => {
  let middleware: AppLoggerMiddleware;
  let mockLogger: jest.Mocked<Logger>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNextFunction: NextFunction;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
    } as any;

    middleware = new AppLoggerMiddleware();
    (middleware as any).logger = mockLogger;

    mockRequest = {
      ip: '127.0.0.1',
      method: 'GET',
      path: '/test',
      get: jest.fn().mockReturnValue('TestUserAgent'),
    };

    // Set up mock response with event handling
    const listeners: { [key: string]: (() => void)[] } = {};
    mockResponse = {
      statusCode: 200,
      on: jest.fn((event: string, callback: () => void) => {
        if (!listeners[event]) {
          listeners[event] = [];
        }
        listeners[event].push(callback);
        return mockResponse as Response;
      }),
      emit: jest.fn((event: string) => {
        if (listeners[event]) {
          listeners[event].forEach((listener) => listener());
        }
        return true;
      }),
    };

    mockNextFunction = jest.fn();

    jest.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log request details when response closes', () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      mockNextFunction,
    );

    (mockResponse.emit as jest.Mock)('close');

    expect(mockNextFunction).toHaveBeenCalled();

    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'START 1000 END 1000 - GET /test 200 - TestUserAgent 127.0.0.1',
      ),
    );
  });

  it('should handle requests without user agent', () => {
    (mockRequest.get as jest.Mock).mockReturnValue('');

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      mockNextFunction,
    );

    (mockResponse.emit as jest.Mock)('close');

    expect(mockNextFunction).toHaveBeenCalled();

    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'START 1000 END 1000 - GET /test 200 -  127.0.0.1',
      ),
    );
  });
});
