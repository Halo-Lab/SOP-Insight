import { RequestHandler } from "express";

export type AuthRequestHandler = RequestHandler<
  any,
  any,
  any,
  any,
  Record<string, any>
>;
export function asHandler(handler: any): AuthRequestHandler {
  return handler as AuthRequestHandler;
}
