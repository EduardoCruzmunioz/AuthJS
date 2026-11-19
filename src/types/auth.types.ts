import { JwtPayload } from "jsonwebtoken";

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface AuthSuccessResponse {
  ok: true;
  uid: string;
  name: string;
  email?: string;
  token: string;
}

export interface AuthErrorResponse {
  ok: false;
  msg: string | Record<string, unknown>;
}

export interface TokenPayload extends JwtPayload {
  uid: string;
  name: string;
}
