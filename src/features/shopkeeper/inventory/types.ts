import { z } from "zod";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const InventoryItemSchema = z.object({
  _id: z.string(),
  itemName: z.string(),
  imeiNumber: z.string().optional(),
  purchasePrice: z.number().optional(),
  expectedPrice: z.number(),
  currentState: z.enum(["new", "good condition"]),
  image: z
    .object({
      public_id: z.string().optional(),
      url: z.string().optional(),
    })
    .optional()
    .nullable(),
  shopkeeper: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Extended fields for website UI if needed
  specs: z
    .object({
      screen: z.string().optional(),
      battery: z.string().optional(),
      processor: z.string().optional(),
    })
    .optional(),
});

export const InventoryListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  statusCode: z.number(),
  data: z.array(InventoryItemSchema),
  meta: z
    .object({
      page: z.number().optional(),
      limit: z.number().optional(),
      total: z.number().optional(),
      totalPages: z.number().optional(),
    })
    .optional(),
});

export const InventorySingleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  statusCode: z.number(),
  data: InventoryItemSchema,
});

export const CreateInventorySchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  imeiNumber: z.string().optional(),
  purchasePrice: z.coerce.number().optional(),
  expectedPrice: z.coerce
    .number()
    .min(0, "Expected price must be non-negative"),
  currentState: z.enum(["new", "good condition"]),
  image: z.any().optional(), // File or string for update
});

export const UpdateInventorySchema = z.object({
  itemName: z.string().min(1, "Item name is required").optional(),
  expectedPrice: z.coerce.number().min(0).optional(),
  currentState: z.enum(["new", "good condition"]).optional(),
  image: z.any().optional(),
});

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type InventoryListResponse = z.infer<typeof InventoryListResponseSchema>;
export type InventorySingleResponse = z.infer<
  typeof InventorySingleResponseSchema
>;
export type CreateInventoryInput = z.infer<typeof CreateInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof UpdateInventorySchema>;
