import { Router } from "express";
import {
  AddElementSchema,
  CreateElementSchema,
  CreateSpaceSchema,
  DeleteElementSchema,
} from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";
export const spaceRouter = Router();

spaceRouter.post("/", async (req, res) => {
  // Create a new space
  const parsedData = CreateSpaceSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed!" });
    return;
  }
  if (!parsedData.data.mapId) {
    const space = await client.space.create({
      data: {
        name: parsedData.data.name,
        width: parseInt(parsedData.data.dimensions.split("x")[0]),
        height: parseInt(parsedData.data.dimensions.split("x")[1]),
        creatorId: req.userId!,
      },
    });
    res.json({ spaceId: space.id });
  }
  const map = await client.map.findUnique({
    where: {
      id: parsedData.data.mapId,
    },
    select: {
      mapElements: true,
      width: true,
      height: true,
    },
  });
  if (!map) {
    res.status(400).json({ message: "Map not found!" });
    return;
  }
  let space = await client.$transaction(async () => {
    const space = await client.space.create({
      data: {
        name: parsedData.data.name,
        width: map.width,
        height: map.height,
        creatorId: req.userId!,
      },
    });
    await client.spaceElements.createMany({
      data: map.mapElements.map((element) => ({
        spaceId: space.id,
        elementId: element.elementId,
        x: element.x!,
        y: element.y!,
      })),
    });
    return space;
  });
  res.json({ spaceId: space.id });
});
spaceRouter.delete("/:spaceId", async (req, res) => {
  // Delete a space
  const space = await client.space.findUnique({
    where: {
      id: req.params.spaceId,
    },
    select: {
      creatorId: true,
    },
  });
  if (!space) {
    res.status(404).json({ message: "Space not found!" });
    return;
  }
  if (space.creatorId != req.userId) {
    res
      .status(403)
      .json({ message: "You are not allowed to delete this space!" });
    return;
  }
  await client.space.delete({
    where: {
      id: req.params.spaceId,
    },
  });
  res.json({ message: "Space Deleted!" });
});
spaceRouter.get("/all", userMiddleware, async (req, res) => {
  const spaces = await client.space.findMany({
    where: {
      creatorId: req.userId!,
    },
  });
  res.json({
    spaces: spaces.map((s) => ({
      id: s.id,
      name: s.name,
      thumbnail: s.thumbnail,
      dimensions: `${s.width}x${s.height}`,
    })),
  });
});
spaceRouter.post("/element", userMiddleware, async (req, res) => {
  const parsedData = AddElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed!" });
    return;
  }
  const space = await client.space.findUnique({
    where: {
      id: req.body.spaceId,
      creatorId: req.userId!,
    },
    select: {
      width: true,
      height: true,
    },
  });
  if (!space) {
    res.status(404).json({ message: "Space not found!" });
    return;
  }
  await client.spaceElements.create({
    data: {
      spaceId: req.body.spaceId,
      elementId: req.body.elementId,
      x: req.body.x,
      y: req.body.y,
    },
  });
});
spaceRouter.delete("/element", async (req, res) => {
  // Delete an element from a space
  const parsedData = DeleteElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed!" });
    return;
  }
  const spaceElement = await client.spaceElements.findFirst({
    where: {
      id: parsedData.data.elementId,
    },
    include: {
      space: true,
    },
  });
  if (
    !spaceElement?.space.creatorId ||
    spaceElement?.space.creatorId !== req.userId
  ) {
    res
      .status(403)
      .json({ message: "You are not allowed to delete this element!" });
    return;
  }
  await client.spaceElements.delete({
    where: {
      id: parsedData.data.elementId,
    },
  });
  res.json({ message: "Element deleted!" });
});
spaceRouter.get("/:spaceId", async (req, res) => {
  // Get a space by id
  const space = await client.space.findUnique({
    where: {
      id: req.params.spaceId,
    },
    include: {
      elements: {
        include: {
          element: true,
        },
      },
    },
  });
  if (!space) {
    res.status(404).json({ message: "Space not found!" });
    return;
  }
  res.json({
    dimensions: `${space.width}x${space.height}`,
    elements: space.elements.map((e) => ({
      id: e.id,
      element: {
        id: e.element.id,
        imageUrl: e.element.imageUrl,
        width: e.element.width,
        height: e.element.height,
        static: e.element.static
      },
      x: e.x,
      y: e.y,
      imageUrl: e.element.imageUrl,
    })),
  });
});
