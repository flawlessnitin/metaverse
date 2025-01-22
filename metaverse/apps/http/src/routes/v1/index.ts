import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { signinSchema, signupSchema } from "../../types";
import client from "@repo/db/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD_SECRET } from "../../config";

export const router = Router();

router.post("/signup", async (req, res) => {
  // check the user
  const parseData = signupSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Invalid data",
      errors: parseData.error.errors,
    });
    return; // return to stop the function
  }
  try {
    // hashing the password
    const hashedPassword = await bcrypt.hash(parseData.data.password, 10);
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
  res.json({
    message: "Signup!",
  });
});
router.post("/signin", async (req, res) => {
  const parseData = signinSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({
      message: "Invalid data",
      errors: parseData.error.errors,
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
      res.status(400).json({ message: "User not found" });
      return;
    }
    const isValid = await bcrypt.compare(
      parseData.data.password,
      user?.password
    );
    if (!isValid) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_PASSWORD_SECRET
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Interal server error" });
  }
});

router.get("/elements", (req, res) => {});
router.get("/avatars", (req, res) => {});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
