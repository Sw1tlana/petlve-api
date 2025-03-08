import { Action } from 'routing-controllers';
import jwt from 'jsonwebtoken';

export const authorizationChecker = (action: Action): boolean => {
    const authorizationHeader = action.request.headers['authorization'];
    console.log("Authorization Header:", authorizationHeader); // Логування
  
    if (!authorizationHeader) {
      return false;
    }
  
    const token = authorizationHeader.split(' ')[1]; // Отримуємо токен з 'Bearer'
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Перевірка токену
      return !!decoded; // Повертає true, якщо токен валідний
    } catch (e) {
      console.error("JWT Verification Error:", e); // Логування помилки
      return false; // Якщо токен не валідний
    }
  };