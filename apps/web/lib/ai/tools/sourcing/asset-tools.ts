import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import {
  createFabricAsset,
  createProductAsset,
  deleteFabricAsset,
  deleteProductAsset,
  listFabrics,
  listProducts,
  requestAssetUploadUrl,
  updateFabricAsset,
  updateProductAsset,
} from "../../server/nest-client";

export function createDesignerAssetTools(ctx: { client: AxiosInstance }) {
  const createFabricAssetTool = tool({
    description: "Create a fabric asset in the sourcing library. Always provide full material metadata.",
    inputSchema: z.object({
      name: z.string().describe("Descriptive name e.g. 'Enzyme-washed linen shirting SS26'"),
      description: z.string().describe(
        "Composition % · weight g/m² · width cm · finish · handle — e.g. '55% linen 45% cotton, 185 g/m², 145 cm, enzyme-washed, soft handle'"
      ),
      imageUrl: z.string(),
      keywords: z.array(z.string().min(2))
        .min(5)
        .max(20)
        .refine((arr) => new Set(arr).size === arr.length, "Keywords must be unique")
        .describe("Min 5 unique tags (≥2 chars each): fiber type, construction, season, color family, garment end-use"),
      composition: z.string().optional().describe("Fiber breakdown e.g. '55% linen, 45% cotton'"),
      weightGsm: z.number().optional().describe("Fabric weight in g/m²"),
      widthCm: z.number().optional().describe("Fabric width in cm"),
      colorName: z.string().optional().describe("Color name e.g. 'ecru', 'forest', 'blush'"),
      finish: z.string().optional().describe("Surface treatment e.g. 'enzyme-washed', 'mercerized', 'brushed'"),
      season: z.string().optional().describe("Target season e.g. 'SS26', 'AW26', 'Resort 2026'"),
      moq: z.number().optional().describe("Minimum order quantity in metres"),
      pricePerUnitMillimes: z.number().optional(),
      supplierRef: z.string().optional(),
    }),
    execute: async (dto) => {
      const asset = await createFabricAsset(ctx.client, dto);
      return { id: asset.id, name: asset.name, kind: "fabric" };
    },
  });

  const createProductAssetTool = tool({
    description: "Create a product reference (garment silhouette) in the sourcing library.",
    inputSchema: z.object({
      name: z.string().describe("Garment name e.g. 'Oversized linen blazer SS26'"),
      description: z.string().optional().describe(
        "Silhouette, construction notes, garment category — e.g. 'relaxed fit blazer, notched lapel, patch pockets, unstructured'"
      ),
      imageUrl: z.string(),
      keywords: z.array(z.string()).min(3).max(20).describe(
        "Tags: garment type, silhouette, season, aesthetic, fabric suggestion"
      ),
      garmentCategory: z.enum([
        "outerwear", "tops", "bottoms", "knitwear", "denim", "accessories", "footwear", "other",
      ]).optional(),
      season: z.string().optional().describe("Target season e.g. 'SS26'"),
      colorName: z.string().optional().describe("Color name e.g. 'ivory', 'forest'"),
    }),
    execute: async (dto) => {
      const asset = await createProductAsset(ctx.client, dto);
      return { id: asset.id, name: asset.name, kind: "product" };
    },
  });

  const searchMyAssets = tool({
    description: "Search your uploaded fabrics and product references by keyword.",
    inputSchema: z.object({
      query: z.string().optional(),
      kind: z.enum(["fabric", "product", "all"]).optional(),
      limit: z.number().optional(),
    }),
    execute: async ({ query, kind, limit }) => {
      const q = query?.trim();
      const params = { q, limit: limit ?? 20 };
      const fabrics =
        kind === "product" ? { data: [] } : await listFabrics(ctx.client, params);
      const products =
        kind === "fabric" ? { data: [] } : await listProducts(ctx.client, params);
      return {
        fabrics: fabrics.data.map((f) => ({ id: f.id, name: f.name, imageUrl: f.imageUrl })),
        products: products.data.map((p) => ({ id: p.id, name: p.name, imageUrl: p.imageUrl })),
      };
    },
  });

  const requestAssetUpload = tool({
    description: "Get a pre-signed upload URL for a new asset image.",
    inputSchema: z.object({
      filename: z.string(),
      contentType: z.string(),
    }),
    execute: async ({ filename, contentType }) => {
      const target = await requestAssetUploadUrl(ctx.client, filename, contentType);
      return {
        uploadUrl: target.uploadUrl,
        key: target.key,
      };
    },
  });

  const deleteAsset = tool({
    description: "Delete one of your uploaded assets.",
    inputSchema: z.object({
      kind: z.enum(["fabric", "product"]),
      assetId: z.string(),
    }),
    execute: async ({ kind, assetId }) => {
      if (kind === "fabric") await deleteFabricAsset(ctx.client, assetId);
      else await deleteProductAsset(ctx.client, assetId);
      return { deleted: true, kind, assetId };
    },
  });

  const updateAssetMetadata = tool({
    description: "Update keywords, description, or sourcing metadata on your asset.",
    inputSchema: z.object({
      kind: z.enum(["fabric", "product"]),
      assetId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      composition: z.string().optional(),
      color: z.string().optional(),
      supplier: z.string().optional(),
      moq: z.number().optional(),
      metadata: z.record(z.string()).optional(),
    }),
    execute: async ({ kind, assetId, ...dto }) => {
      const asset =
        kind === "fabric"
          ? await updateFabricAsset(ctx.client, assetId, dto)
          : await updateProductAsset(ctx.client, assetId, dto);
      return { id: asset.id, name: asset.name, kind, updated: true };
    },
  });

  return {
    createFabricAsset: createFabricAssetTool,
    createProductAsset: createProductAssetTool,
    searchMyAssets,
    requestAssetUpload,
    deleteAsset,
    updateAssetMetadata,
  };
}
