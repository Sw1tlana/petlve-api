import "reflect-metadata";
import express from "express";
import { useExpressServer, Action } from "routing-controllers";
import jwt from "jsonwebtoken";

import { authorizationChecker } from "../utils/authorizationChecker";
import { HTTPRequestLogger } from "../app/middlewares/HTTPRequestLogger"; 
import { HTTPResponseLogger } from "../app/middlewares/HTTPResponseLogger";
import { UsersController } from "../app/controllers/UsersController";
import { NoticesController } from "../app/controllers/NoticesController";
import { FriendsController } from "../app/controllers/FriendsController";
import { NewsController } from "../app/controllers/NewsController";
import { CitiesController } from "../app/controllers/CitiesController";
import { User } from "../app/domain/models/User.model";
import path from "path";

export class Tcp {
  private static instance: Tcp; 

  private routePrefix = "/api";
  public server = express(); 

  constructor() {

    if (!Tcp.instance) {
      Tcp.instance = this;
    }

    return Tcp.instance;
  }

  private async currentUserChecker(action: Action) {
    try {
      const { authorization = "" } = action.request.headers;
      if (!authorization.startsWith("Bearer ")) {
        console.log("Invalid or missing authorization header");
        return null;
      }

      const token = authorization.split(" ")[1];
      console.log("Received token:", token);

      if (!token) {
        console.log("Token is missing");
        return null;
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      if (!decoded || !decoded.id) {
        console.log("Invalid token payload");
        return null;
      }

      const user = await User.findById(decoded.id);
      console.log("User from database:", user);

      return user || null;
    } catch (error) {
      console.error("Token verification error:", error.message);
      return null;
    }
  }

  async init() {
    const { server, routePrefix } = this;

    server.use(express.json());

    const uploadsPath = path.resolve(process.cwd(), "uploads");
    console.log("Serving uploads from:", uploadsPath); 
    server.use("/uploads", express.static(uploadsPath));

    useExpressServer(server, {
      routePrefix,
      controllers: [UsersController, 
                    NoticesController,
                    FriendsController,
                    NewsController,
                    CitiesController],
      middlewares: [HTTPRequestLogger, 
                    HTTPResponseLogger],
      cors: true,
      defaultErrorHandler: true,
      validation: false,
      authorizationChecker, 
      currentUserChecker: this.currentUserChecker,  
    });

    const PORT = process.env.PORT || 4000; 

    return new Promise<boolean>((resolve) => {
      server.listen(PORT, () => {
        console.log(`Tcp service started on port ${PORT}`);
        resolve(true); 
      });
    })
  }
}