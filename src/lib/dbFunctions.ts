import dbConnect from "./dbConnect";
import { cache } from "react";

import User, { IUser } from "@/models/User";
import house, { Ihouse } from "@/models/house";
import favorite from "@/models/favorite";
import Pending from "@/models/Pending";
import Review from "@/models/Review";
import { SearchFilterSchema, SearchFilterInput } from "./validations";
import { FilterQuery, Types } from "mongoose";

// ============================================
// Types
// ============================================
type UserInput = Omit<IUser, "_id" | "createdAt" | "updatedAt">;

// ============================================
// USER FUNCTIONS
// ============================================

//get owner id by house id

export async function createUser(userData: UserInput) {
  try {
    await dbConnect();

    const user = await User.create(userData);
    return user;
  } catch (error: unknown) {
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    await dbConnect();

    return await User.findOne({ clerkId });
  } catch (error: unknown) {
    throw error;
  }
}

export async function getUserById(userId: string) {
  try {
    await dbConnect();
    return await User.findById(userId);
  } catch (error: unknown) {
    throw error;
  }
}
export async function updateUserByClerkId(
  clerkId: string,
  updateData: Partial<IUser>
) {
  try {
    await dbConnect();

    return await User.findOneAndUpdate({ clerkId }, updateData, { new: true });
  } catch (error: unknown) {
    throw error;
  }
}

export async function deleteUserByClerkId(clerkId: string) {
  try {
    await dbConnect();

    return await User.findOneAndDelete({ clerkId });
  } catch (error: unknown) {
    throw error;
  }
}

export async function updateRoleToOwner(clerkId: string) {
  try {
    await dbConnect();

    return await User.findOneAndUpdate(
      { clerkId },
      { role: "OWNER" },
      { new: true }
    );
  } catch (error: unknown) {
    throw error;
  }
}

// ============================================
// HOUSE FUNCTIONS
// ============================================
export async function createHouse(houseData: Ihouse) {
  try {
    await dbConnect();
    return await house.create(houseData);
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Helper to check if a house is available during a specific date range.
 * If no dates are provided, it checks for "Available Now" (today).
 */
export async function getAvailabilityStatus(
  houseId: string,
  startDate?: Date,
  endDate?: Date
): Promise<boolean> {
  await dbConnect();
  
  // 1. Check if the house is even listed
  const houseData = await house.findById(houseId).select("available").lean() as { available?: boolean } | null;
  if (!houseData || houseData.available === false) {
    return false;
  }

  const now = new Date();
  const start = startDate || new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = endDate || start;

  const activeReservation = await Pending.findOne({
    houseId,
    status: "approved",
    startDate: { $lte: end },
    endDate: { $gte: start },
  });

  return !activeReservation;
}

export const getAllhouses = cache(async (filters: Partial<SearchFilterInput> = {}) => {
  try {
    const result = SearchFilterSchema.safeParse(filters);
    const validatedFilters = result.success ? result.data : SearchFilterSchema.parse({});
    
    const { 
      page, 
      limit, 
      location: locationFilter, 
      minPrice, 
      maxPrice, 
      startDate, 
      endDate,
      onlyAvailable,
      amenities,
      propertyType,
      sortBy,
      north,
      south,
      east,
      west
    } = validatedFilters;

    await dbConnect();
    const skip = (page - 1) * limit;
    const query: FilterQuery<Ihouse> = { available: { $ne: false } };

    if (locationFilter) {
      query.location = { $regex: locationFilter, $options: "i" };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.pricePerDay = {};
      if (minPrice !== undefined) query.pricePerDay.$gte = minPrice;
      if (maxPrice !== undefined) query.pricePerDay.$lte = maxPrice;
    }

    if (amenities && amenities.length > 0) {
      query.amenities = { $all: amenities };
    }

    // Property type filtering
    if (propertyType && propertyType.length > 0) {
      query.propertyType = { $in: propertyType };
    }

    // Viewport filtering
    if (north !== undefined && south !== undefined && east !== undefined && west !== undefined) {
      query.lat = { $gte: south, $lte: north };
      query.lng = { $gte: west, $lte: east };
    }

    if (onlyAvailable || (startDate && endDate)) {
      const now = new Date();
      const start = startDate || new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const end = endDate || start;

      const reservedHouseIds = await Pending.find({
        status: "approved",
        startDate: { $lte: end },
        endDate: { $gte: start },
      }).distinct("houseId");

      if (reservedHouseIds.length > 0) {
        query._id = { $nin: reservedHouseIds };
      }
    }

    // Dynamic sorting based on sortBy parameter
    let sortOptions: Record<string, 1 | -1> = {};
    switch (sortBy) {
      case "price-asc":
        sortOptions = { pricePerDay: 1 };
        break;
      case "price-desc":
        sortOptions = { pricePerDay: -1 };
        break;
      case "rating-desc":
        sortOptions = { rating: -1, createdAt: -1 };
        break;
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; // Default to newest
    }

    const [totalHouses, housesRaw] = await Promise.all([
      house.countDocuments(query),
      house.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
    ]);
 
    const houseIds = housesRaw.map(h => (h as unknown as { _id: Types.ObjectId })._id.toString());
    const availabilityMap = await batchIsHouseAvailable(houseIds);

    const houses = housesRaw.map(h => {
      const houseObj = h as unknown as Ihouse & { _id: Types.ObjectId; ownerId?: Types.ObjectId };
      return {
        ...houseObj,
        _id: houseObj._id.toString(),
        ownerId: houseObj.ownerId?.toString(),
        isAvailable: availabilityMap[houseObj._id.toString()] ?? true
      };
    });

    return {
      houses,
      totalPages: Math.ceil(totalHouses / limit),
      currentPage: page,
    };
  } catch (error: unknown) {
    throw error;
  }
});

export async function gethousesByOwner(
  userId: string,
  page: number = 1,
  limit: number = 9
) {
  try {
    await dbConnect();
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 9);
    const skip = (pageNum - 1) * limitNum;
    const [total, houses] = await Promise.all([
      house.countDocuments({ ownerId: userId }),
      house.find({ ownerId: userId }).skip(skip).limit(limitNum).lean(),
    ]);

    return {
      houses: houses as unknown as Ihouse[],
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    };
  } catch (error: unknown) {
    throw error;
  }
}

export const gethouseById = cache(async (houseId: string) => {
  try {
    if (!houseId) throw new Error("house ID is required");
    await dbConnect();
    const result = await house.findById(houseId).populate("ownerId", "name imageUrl").lean();
    if (!result) return null;
    
    const houseObj = result as unknown as Ihouse & { _id: Types.ObjectId; ownerId: { _id: Types.ObjectId } | Types.ObjectId };
    return {
      ...houseObj,
      _id: houseObj._id.toString(),
      ownerId: (houseObj.ownerId as { _id: Types.ObjectId })._id?.toString() || (houseObj.ownerId as Types.ObjectId).toString(),
      owner: houseObj.ownerId,
    };
  } catch (error: unknown) {
    throw error;
  }
});

// ============================================
// FAVORITE FUNCTIONS
// ============================================
export async function addfavorite(userId: string, houseId: string) {
  try {
    await dbConnect();

    const existing = await favorite.findOne({ userId, houseId });
    if (existing) {
      return { favorite: existing, alreadyExists: true }; // ✅ indicate duplicate
    }

    const newFav = await favorite.create({ userId, houseId });
    return { favorite: newFav, alreadyExists: false };
  } catch (error: unknown) {
    throw error;
  }
}

export async function getUserfavorites(
  userId: string,
  page: number = 1,
  limit: number = 9
) {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;
    const [total, favorites] = await Promise.all([
      favorite.countDocuments({ userId }),
      favorite.find({ userId }).populate("houseId").skip(skip).limit(limit).lean(),
    ]);

    return {
      favorites: favorites as unknown as { houseId: Ihouse }[],
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error: unknown) {
    throw error;
  }
}

export async function removefavorite(userId: string, houseId: string) {
  try {
    await dbConnect();

    return await favorite.findOneAndDelete({ userId, houseId });
  } catch (error: unknown) {
    throw error;
  }
}

export async function getfavoritesCount(clerkId: string): Promise<number> {
  try {
    await dbConnect();

    const user = await User.findOne({ clerkId });
    if (!user) return 0;

    return await favorite.countDocuments({ userId: user._id });
  } catch (error: unknown) {
    throw error;
  }
}

// ============================================
// PENDING FUNCTIONS
// ============================================
export async function createPending({
  buyerId,
  ownerId,
  houseId,
  startDate,
  endDate,
}: {
  buyerId: string;
  ownerId: string;
  houseId: string;
  startDate: Date;
  endDate: Date;
}) {
  try {
    await dbConnect();

    const existing = await Pending.findOne({
      buyerId,
      houseId,
      ownerId,
      status: "pending",
      startDate,
      endDate,
    });

    if (existing) {
      return existing;
    }

    const pending = await Pending.create({
      buyerId,
      ownerId,
      houseId,
      startDate,
      endDate,
    });

    return pending;
  } catch (error: unknown) {
    throw error;
  }
}

export async function getPendingByOwner(
  ownerId: string,
  page: number = 1,
  limit: number = 9
) {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;
    const [total, pendings] = await Promise.all([
      Pending.countDocuments({ ownerId, status: "pending" }),
      Pending.find({ ownerId, status: "pending" })
        .populate("houseId")
        .populate("buyerId", "name email imageUrl")
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return {
      pendings: pendings as unknown as { houseId: Ihouse; buyerId: IUser }[],
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error: unknown) {
    throw error;
  }
}
export async function getPendingCount(clerkId: string): Promise<number> {
  try {
    await dbConnect();

    const user = await User.findOne({ clerkId });
    if (!user) return 0;

    // If user is basic USER, count their outbound requests
    if (user.role === "USER") {
      return await Pending.countDocuments({ buyerId: user._id, status: "pending" });
    }

    // If user is OWNER, count inbound requests
    return await Pending.countDocuments({ ownerId: user._id, status: "pending" });
  } catch (error: unknown) {
    throw error;
  }
}

export async function getPendingByhouse(houseId: string) {
  try {
    await dbConnect();
    return await Pending.find({ houseId }).populate("buyerId");
  } catch (error: unknown) {
    throw error;
  }
}

export async function getPendingByBuyerHouse(buyerId: string, houseId: string) {
  try {
    await dbConnect();

    // return a single pending matching buyer + house with status 'pending'
    return await Pending.findOne({ buyerId, houseId, status: "pending" });
  } catch (error: unknown) {
    throw error;
  }
}

export async function getPendingByBuyer(
  buyerId: string,
  page: number = 1,
  limit: number = 9
) {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;
    const query = {
      buyerId,
      status: { $ne: "pending" },
      buyerArchived: { $ne: true },
    };
    const [total, pendings] = await Promise.all([
      Pending.countDocuments(query),
      Pending.find(query)
        .populate("houseId")
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return {
      pendings: pendings as unknown as (Ihouse & { 
        _id: string; 
        houseId: Ihouse; 
        status: string; 
        createdAt: string; 
        startDate: string; 
        endDate: string;
        ownerId: string;
        buyerId: string;
      })[],
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error: unknown) {
    throw error;
  }
}

export async function updatePendingStatus(
  pendingId: string,
  status: "pending" | "approved" | "rejected"
) {
  try {
    await dbConnect();

    const pending = await Pending.findById(pendingId);
    if (!pending) {
      throw new Error("Pending not found");
    }
 
    if ((pending as unknown as { status: string }).status === status) {
      return pending;
    }

    const updated = await Pending.findByIdAndUpdate(
      pendingId,
      { status },
      { new: true }
    );
    return updated;
  } catch (error: unknown) {
    throw error;
  }
}

export async function deletePending(pendingId: string) {
  try {
    await dbConnect();
    return await Pending.findByIdAndDelete(pendingId);
  } catch (error: unknown) {
    throw error;
  }
}

export async function clearAllNotifications(userId: string) {
  try {
    await dbConnect();
    // Soft delete: hide all non-pending requests from buyer
    return await Pending.updateMany({
      buyerId: userId,
      status: { $ne: "pending" }
    }, {
      $set: { buyerArchived: true }
    });
  } catch (error: unknown) {
    throw error;
  }
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================
export async function getNotificationCount(clerkId: string): Promise<number> {
  try {
    await dbConnect();

    const user = await User.findOne({ clerkId });
    if (!user) return 0;

    return await Pending.countDocuments({
      buyerId: user._id,
      status: { $ne: "pending" },
      buyerArchived: { $ne: true },
    });
  } catch (error: unknown) {
    throw error;
  }
}

// ============================================
// approved FUNCTIONS
// ============================================
export async function getApprovedByHouse(houseId: string) {
  try {
    await dbConnect();

    const now = new Date();
    // Today at UTC midnight
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    return await Pending.find({
      houseId,
      status: "approved",
      endDate: { $gte: today }, // keep only future or ongoing reservations (UTC comparison)
    });
  } catch (error: unknown) {
    throw error;
  }
}
// ============================================
// REAL-TIME AVAILABILITY CHECK
// ============================================
export async function isHouseAvailable(houseId: string): Promise<boolean> {
  try {
    await dbConnect();

    // 1. Check listing status first
    const h = await house.findById(houseId).select("available").lean() as { available?: boolean } | null;
    if (!h || h.available === false) {
      return false;
    }

    const now = new Date();
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    // Check if there are any approved reservations that include today
    const activeReservation = await Pending.findOne({
      houseId,
      status: "approved",
      startDate: { $lte: todayUTC },
      endDate: { $gte: todayUTC },
    });

    return !activeReservation;
  } catch (error: unknown) {
    return true; 
  }
}

export async function batchIsHouseAvailable(
  houseIds: string[]
): Promise<Record<string, boolean>> {
  try {
    await dbConnect();

    // 1. Get current listed status for all houses
    const houses = await house.find({ _id: { $in: houseIds } }).select("available").lean();
    const listedMap: Record<string, boolean> = {};
    houses.forEach(h => {
      listedMap[(h as unknown as { _id: Types.ObjectId })._id.toString()] = (h as unknown as { available?: boolean }).available !== false;
    });

    const now = new Date();
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    // Find all active reservations for the given house IDs
    const activeReservations = await Pending.find({
      houseId: { $in: houseIds },
      status: "approved",
      startDate: { $lte: todayUTC },
      endDate: { $gte: todayUTC },
    }).select("houseId");

    const reservedHouseIds = new Set(
      activeReservations.map((res) => res.houseId.toString())
    );

    const result: Record<string, boolean> = {};
    houseIds.forEach((id) => {
      // Available if listed AND not reserved
      result[id] = (listedMap[id] ?? true) && !reservedHouseIds.has(id);
    });

    return result;
  } catch (error: unknown) {
    // Return empty results or default to available
    const fallback: Record<string, boolean> = {};
    houseIds.forEach((id) => (fallback[id] = true));
    return fallback;
  }
}

// ============================================
// REVIEW FUNCTIONS
// ============================================
export async function createReview(reviewData: {
  houseId: string;
  userId: string;
  rating: number;
  comment: string;
}) {
  try {
    await dbConnect();
    
    // Create the review
    const review = await Review.create(reviewData);

    // Calculate new average rating for the house
    const reviews = await Review.find({ houseId: reviewData.houseId });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      // Update house with new average (rounded to 1 decimal place)
      await house.findByIdAndUpdate(reviewData.houseId, { 
        rating: Math.round(averageRating * 10) / 10 
      });
    }

    return review;
  } catch (error: unknown) {
    throw error;
  }
}

export async function canUserReview(userId: string, houseId: string): Promise<boolean> {
  try {
    await dbConnect();
    
    // Check if user has ANY approved reservation for this house
    const reservation = await Pending.findOne({
      buyerId: userId,
      houseId: houseId,
      status: "approved",
    });

    return !!reservation;
  } catch (error: unknown) {
    return false;
  }
}

export async function getReviewsByHouseId(houseId: string) {
  try {
    await dbConnect();
    return await Review.find({ houseId })
      .sort({ createdAt: -1 })
      .populate("userId", "name imageUrl")
      .lean();
  } catch (error: unknown) {
    throw error;
  }
}

export async function getFeaturedHouses(limit: number = 4) {
  try {
    await dbConnect();
    return await house
      .find({ available: true, rating: { $gte: 4 } }) // Only available and highly rated
      .sort({ rating: -1, pricePerDay: 1 }) // Highest rating, then cheapest
      .limit(limit)
      .lean();
  } catch (error: unknown) {
    return [];
  }
}

export async function getRecentReviews(limit: number = 6) {
  try {
    await dbConnect();
    return await Review.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name imageUrl")
      .populate("houseId", "_id title images") // Populate house details for linking
      .lean();
  } catch (error: unknown) {
    return [];
  }
}
