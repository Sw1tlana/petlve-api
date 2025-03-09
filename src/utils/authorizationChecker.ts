import jwt from "jsonwebtoken";
import { User } from "../app/domain/models/User.model";
import { Action } from "routing-controllers";

export const authorizationChecker = async (action: Action): Promise<boolean> => {
  try {
    console.log("Authorization header:", action.request.headers.authorization);

    // Дозволяємо запит на оновлення токенів без перевірки авторизації
    if (action.request.url === "/refresh-tokens") {
      return true;
    }

    const { authorization = "" } = action.request.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      console.log("Missing or invalid authorization header");
      return false;
    }

    const token = authorization.split(" ")[1];
    console.log("Received token:", token);

    if (!token) {
      console.log("Token is missing");
      return false;
    }

    // Перевірка токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    if (!decoded || !decoded.id) {
      console.log("Invalid token payload");
      return false;
    }

    // Шукаємо користувача по ID з токена
    const user = await User.findById(decoded.id);
    console.log("User from database:", user);

    if (!user) {
      console.log("User not found");
      return false;
    }

    // Токен дійсний, доступ дозволено
    return true;
  } catch (error) {
    console.error("Token verification error:", error.message);
    return false;
  }
};
