import { Request, Response, NextFunction } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import jwt, { JwtPayload } from "jsonwebtoken";

import { User } from "../domain/models/User.model";

interface TokenPayload extends JwtPayload {
    id: string;
    name: string;
  }

@Middleware({ type: "before" })
export class AuthMiddleware implements ExpressMiddlewareInterface {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

          try {
            if (!process.env.JWT_SECRET) {
              throw new Error("JWT_SECRET is not defined");
            }
      
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
      
            if (!decoded.id || !decoded.name) {
              return res.status(401).json({ success: false, message: "Unauthorized: Invalid token payload" });
            }
    
            const user = await User.findById(decoded.id);
            if (!user) {
              return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
            }
      
            (req as any).user = user; 
            
            next(); 
          } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or missing token" });
          }
    }
}
