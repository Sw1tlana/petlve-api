import "reflect-metadata";
import express from "express";
import { useExpressServer, Action } from "routing-controllers";
import jwt from "jsonwebtoken";

// Імпортуємо наш інтерфейс сервісу і контролери
import { authorizationChecker } from "../utils/authorizationChecker";
import { HTTPRequestLogger } from "../app/middlewares/HTTPRequestLogger"; 
import { HTTPResponseLogger } from "../app/middlewares/HTTPResponseLogger";
import { UsersController } from "../app/controllers/UsersController";
import { NoticesController } from "app/controllers/NoticesController";
import { FriendsController } from "app/controllers/FriendsController";
import { NewsController } from "app/controllers/NewsController"
import { CitiesController } from "app/controllers/CitiesController";
import { User } from "../app/domain/models/User.model";

// Оголошуємо клас Tcp, який реалізує інтерфейс IService
export class Tcp {
  private static instance: Tcp; // Ссылка на единственный экземпляр класса

  private routePrefix = "/api"; // Префикс для маршрутов API
  public server = express(); // Экземпляр Express.js

  // Конструктор, що реалізує шаблон Singleton для класу Tcp
  constructor() {
    // Якщо екземпляр ще не створено, зберігаємо посилання на поточний екземпляр
    if (!Tcp.instance) {
      Tcp.instance = this;
    }

    // Повертаємо посилання на єдиний екземпляр класу
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

      // Розшифровуємо токен
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      if (!decoded || !decoded.id) {
        console.log("Invalid token payload");
        return null;
      }

      // Шукаємо користувача в базі
      const user = await User.findById(decoded.id);
      console.log("User from database:", user);

      return user || null;
    } catch (error) {
      console.error("Token verification error:", error.message);
      return null;
    }
  }

  // Метод для ініціалізації сервісу
  async init() {
    const { server, routePrefix } = this;

    // Парсимо тіло запиту, потрібно для middlewares
    server.use(express.json());

    // Використовуємо бібліотеку routing-controllers для налаштування маршрутів
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

    return new Promise<boolean>((resolve) => {
      server.listen(4000, () => {
        console.log("Tcp service started on port 4000");

        return resolve(true);
      });
    });
  }
}