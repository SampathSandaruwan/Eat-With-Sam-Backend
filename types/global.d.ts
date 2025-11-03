import { UserModel } from '../models';


// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserModel;
    }
  }
}
