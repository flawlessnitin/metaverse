import z from "zod";

export const signupSchema = z.object({
  username: z.string().email(),
  password: z.string().min(8),
  type: z.enum(["user", "admin"]),
});

export const signinSchema = z.object({
  username: z.string().email(),
  password: z.string().min(8),
});

export const updateMetadataSchema = z.object({
  avatarId: z.string(),
});

export const getMetadataSchema = z.object({
  avatarId: z.string(),
});

export const CreateSpaceSchema = z.object({
  name: z.string(),
  dimension: z.string().regex(/^[0-9]{1, 4}x[0-9]{1,4}$/),
  mapId: z.string(),
  type: z.enum(["public", "private"]),
});

export const AddElementSchema = z.object({
  spaceId: z.string(),
  elementId: z.string(),
  x: z.number(),
  y: z.number(),
})

export const CreateElementSchema = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean(),
})

export const UpdateElementSchema = z.object({
  imageUrl: z.string(),
})

export const CreateAvatarSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
})

export const CreateMapSchema = z.object({
  thumbnail: z.string(),
  dimensions: z.string().regex(/^[0-9]{1, 4}x[0-9]{1,4}$/),
  defaultElement: z.string(z.object({
    elementId: z.string(),
    x: z.number(),
    y: z.number(),
  })),
})
