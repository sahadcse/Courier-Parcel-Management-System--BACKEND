// src/types/express/index.d.ts
import { UserPayload } from 'types/auth.types';

declare namespace Express {
  export interface Request {
    user?: UserPayload;
  }
}
