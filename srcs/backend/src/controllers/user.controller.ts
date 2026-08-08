import type { Request, Response } from "express";

export function userCheck(req: Request, res: Response) {
  res.json({ status: "ok this is a test" });
}

export function userCheckBody(req: Request, res: Response) {
  res.json({
    status: "ok",
    data: req.body,
  });
}
