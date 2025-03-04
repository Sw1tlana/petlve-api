import type { NextFunction, Request, Response } from "express";
import type { ExpressMiddlewareInterface } from "routing-controllers";

export class HTTPResponseLogger implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction) {
    const { originalUrl, method } = request;

    response.on("finish", () => {
      const { statusCode } = response;
      console.log(`📡 Response: method=${method} path=${originalUrl} status=${statusCode}`);
    });

    next();
  }
}
