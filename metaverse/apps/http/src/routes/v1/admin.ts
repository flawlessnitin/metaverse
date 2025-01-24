import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import {
  CreateAvatarSchema,
  CreateElementSchema,
  CreateMapSchema,
  UpdateElementSchema,
} from "../../types";
import client from "@repo/db/client";
export const adminRouter = Router();

adminRouter.post("/element", adminMiddleware, async (req, res) => {
  const parsedData = CreateElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed!" });
    return;
  }
  const element = await client.spaceElements.create({
    data: {
      width: parsedData.data.width,
      height: parsedData.data.height,
      static: parsedData.data.static,
      imageUrl: parsedData.data.imageUrl,
    },
  });
  res.json({
    id: element.id,
    message: "Element created!",
  });
});
adminRouter.put("/element/:elementId", async (req, res) => {
  // Update an element
  const parsedData = UpdateElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed!" });
    return;
  }
  await client.element.update({
    where: {
      id: req.params.elementId,
    },
    data: {
      imageUrl: parsedData.data.imageUrl,
    },
  });
  res.json({ message: "Element updated!" });
});
adminRouter.get("/avatar", async (req, res) => {
  // Get all avatars
  const parsedData = CreateAvatarSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed!" });
    return;
  }
  const avatar = await client.avatar.create({
    data: {
      name: parsedData.data.name,
      imageUrl: parsedData.data.imageUrl,
    },
  });
  res.json({ avatarId: avatar.id });
});
adminRouter.get("/map", async (req, res) => {
  const parsedData = CreateMapSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed!" });
    return;
  }
  const map = await client.map.create({
    data: {
      name: parsedData.data.name,
      width: parseInt(parsedData.data.dimensions.split("x")[0]),
      height: parseInt(parsedData.data.dimensions.split("x")[1]),
      thumbnail: parsedData.data.thumbnail,
      dimensions: parsedData.data.dimensions,
      defaultElement: parsedData.data.defaultElement,
    },
  });
  res.json({ mapId: map.id });
});
