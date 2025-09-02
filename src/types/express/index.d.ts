import { UserPayload } from 'types/auth.types';

// src/types/express/index.d.ts
declare namespace Express {
  export interface Request {
    user?: UserPayload;
  }
}
