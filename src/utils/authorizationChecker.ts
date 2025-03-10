import jwt from "jsonwebtoken";
import { User } from "../app/domain/models/User.model";
import { Action } from "routing-controllers";

export const authorizationChecker = async (action: Action): Promise<boolean> => {
  try {
    const { authorization = "" } = action.request.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return false;
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return false;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return false;
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return false;
    }

    action.request.user = user; 
    return true;

  } catch (error) {
    return false;
  }
};
