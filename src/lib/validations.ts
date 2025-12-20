import { z } from "zod";

export const HouseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  pricePerDay: z.number().positive("Price must be a positive number"),
  telephone: z.string().regex(/^[0-9+]+$/, "Invalid telephone format"),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const ReservationSchema = z.object({
  houseId: z.string().min(1, "House ID is required"),
  ownerId: z.string().min(1, "Owner ID is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.startDate < data.endDate, {
  message: "Start date must be before end date",
  path: ["startDate"],
});

export const SearchFilterSchema = z.object({
  location: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  amenities: z.union([z.string(), z.array(z.string())]).optional().transform((val) => {
    if (typeof val === "string") return [val];
    return val;
  }),
  onlyAvailable: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(9),
  // Viewport bounds for map search
  north: z.coerce.number().optional(),
  south: z.coerce.number().optional(),
  east: z.coerce.number().optional(),
  west: z.coerce.number().optional(),
});

export type HouseInput = z.infer<typeof HouseSchema>;
export type ReservationInput = z.infer<typeof ReservationSchema>;
export type SearchFilterInput = z.infer<typeof SearchFilterSchema>;
