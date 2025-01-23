import jwt from 'jsonwebtoken';
import { JWT_PASSWORD_SECRET } from '../config';
import { NextFunction, Request, Response } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.split(" ")[1];

  if(!token) {
    res.status(403).json({message: "Unauthorized"});
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_PASSWORD_SECRET) as {userId: string, role: string};
    if(decoded.role !== 'admin') {
      res.status(403).json({message: "Unauthorized"});
      return;
    }
    req.userId = decoded.userId;
    next()
  }catch(e) {
    res.status(403).json({message: "Unauthorized"});
  }
}
