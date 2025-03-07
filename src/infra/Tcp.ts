import "reflect-metadata";
import express from "express";
import { useExpressServer } from "routing-controllers";

// Імпортуємо наш інтерфейс сервісу і контролери
import { IService } from "types/services";
import { HTTPRequestLogger } from "../app/middlewares/HTTPRequestLogger"; 
import { HTTPResponseLogger } from "../app/middlewares/HTTPResponseLogger";
import { UsersController } from "../app/controllers/UsersController";
import { NoticesController } from "app/controllers/NoticesController";
import { FriendsController } from "app/controllers/FriendsController";

// Оголошуємо клас Tcp, який реалізує інтерфейс IService
export class Tcp implements IService {
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
                    FriendsController],
      middlewares: [HTTPRequestLogger, HTTPResponseLogger],
      cors: true,
      defaultErrorHandler: true,
      validation: false, // Відключаємо вбудовану валідацію, щоб ми могли перевірити DTO самі всередині контролера
    });

    // Повертаємо Promise, який успішно виконується, коли сервер починає слухати порт
    return new Promise<boolean>((resolve) => {
      server.listen(4000, () => {
        console.log("Tcp service started on port 4000");

        return resolve(true);
      });
    });
  }
}