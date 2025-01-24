import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { signinSchema, signupSchema } from "../../types";
import client from "@repo/db/client";
import { hash, compare } from "../../scrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD_SECRET } from "../../config";

export const router = Router();

router.post("/signup", async (req, res) => {
  // check the user
  const parseData = signupSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return; // return to stop the function
  }
  // hashing the password
  const hashedPassword = await hash(parseData.data.password);
  try {
    // save the user
    const user = await client.user.create({
      data: {
        username: parseData.data.username,
        password: hashedPassword,
        role: parseData.data.type === "admin" ? "Admin" : "User",
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (e) {
    res.status(400).json({ message: "User already exists" });
  }
});
router.post("/signin", async (req, res) => {
  const parseData = signinSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }
  try {
    const user = await client.user.findUnique({
      where: {
        username: parseData.data.username,
      },
    });
    if (!user) {
      res.status(403).json({ message: "User not found" });
      return;
    }
    const isValid = await compare(parseData.data.password, user?.password);
    if (!isValid) {
      res.status(403).json({ message: "Invalid password" });
      return;
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_PASSWORD_SECRET
    );
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: "Interal server error" });
  }
});

router.get("/elements", async (req, res) => {
  // Get all elements
  const elements = await client.element.findMany();
  res.json({
    elements: elements.map((element) => ({
      id: element.id,
      imageUrl: element.imageUrl,
      width: element.width,
      height: element.height,
      static: element.static,
    })),
  })
});
router.get("/avatars",async (req, res) => {
  // Get all avatars
  const avatars = await client.avatar.findMany();
  res.json({avatars: avatars.map((avatar) => {
    id: avatar.id,
    imageUrl: avatar.imageUrl
  })});
});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
