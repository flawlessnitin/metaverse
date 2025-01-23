import { Router } from "express";
import { userMiddleware } from "../../middleware/user";
import client from "@repo/db/client";
import { updateMetadataSchema } from "../../types";
export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, (req, res) => {
  const parsedData = updateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed!" });
    return;
  }
  await client.user.update({
    where: {
      id: req.userId,
    },
    data: parsedData.data.avatarId,
  });
});
userRouter.get("/metadata/bulk", (req, res) => {});
