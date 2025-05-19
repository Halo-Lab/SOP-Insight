import { Request, Response } from "express";
import { Sentry } from "../../sentry.js";

export const testSentry = (req: Request, res: Response): void => {
  try {
    throw new Error("Test Sentry Error on Server");
  } catch (err) {
    Sentry.captureException(err);
    res.status(200).json({ message: "Error sent to Sentry!" });
  }
};
