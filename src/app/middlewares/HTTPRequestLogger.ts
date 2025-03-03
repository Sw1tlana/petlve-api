import type { NextFunction, Request, Response } from "express";
import type { ExpressMiddlewareInterface } from "routing-controllers";
import { Middleware } from "routing-controllers";

@Middleware({ type: "before" })
export class HTTPRequestLogger implements ExpressMiddlewareInterface {
  use(request: Request, _response: Response, next: NextFunction) {
    const { originalUrl, method, body } = request;
  
    console.log(
      `Received request: method=${method} path=${originalUrl}`,
      JSON.stringify(body)
    );

    next();
  }
}