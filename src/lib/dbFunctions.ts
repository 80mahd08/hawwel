import dbConnect from "./dbConnect";
import { cache } from "react";

import User, { IUser } from "@/models/User";
import house, { Ihouse } from "@/models/house";
import favorite from "@/models/favorite";
import Pending from "@/models/Pending";
import { SearchFilterSchema, SearchFilterInput } from "./validations";

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
  } catch (error: any) {
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    await dbConnect();

    return await User.findOne({ clerkId });
  } catch (error: any) {
    throw error;
  }
}

export async function getUserById(userId: string) {
  try {
    await dbConnect();
    return await User.findById(userId);
  } catch (error: any) {
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
  } catch (error: any) {
    throw error;
  }
}

export async function deleteUserByClerkId(clerkId: string) {
  try {
    await dbConnect();

    return await User.findOneAndDelete({ clerkId });
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  const houseData = await house.findById(houseId).select("available").lean();
  if (!houseData || (houseData as any).available === false) {
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

export const getAllhouses = cache(async (filters: any = {}) => {
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
      north,
      south,
      east,
      west
    } = validatedFilters;

    await dbConnect();
    const skip = (page - 1) * limit;
    const query: any = { available: { $ne: false } };

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

    const [totalHouses, housesRaw] = await Promise.all([
      house.countDocuments(query),
      house.find(query).skip(skip).limit(limit).lean(),
    ]);

    const houseIds = housesRaw.map(h => (h as any)._id.toString());
    const availabilityMap = await batchIsHouseAvailable(houseIds);

    const houses = housesRaw.map(h => {
      const houseObj = h as any;
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
  } catch (error: any) {
    console.error("Error in getAllhouses:", error);
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
    
    console.log(`gethousesByOwner: page=${pageNum}, limit=${limitNum}`);
    const skip = (pageNum - 1) * limitNum;
    const [total, houses] = await Promise.all([
      house.countDocuments({ ownerId: userId }),
      house.find({ ownerId: userId }).skip(skip).limit(limitNum).lean(),
    ]);

    console.log(`gethousesByOwner: found ${houses.length} houses. Total: ${total}`);

    return {
      houses: houses as any[],
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    };
  } catch (error: any) {
    throw error;
  }
}

export const gethouseById = cache(async (houseId: string) => {
  try {
    if (!houseId) throw new Error("house ID is required");
    await dbConnect();
    const result = await house.findById(houseId).lean();
    if (!result) return null;
    
    const houseObj = result as any;
    return {
      ...houseObj,
      _id: houseObj._id.toString(),
      ownerId: houseObj.ownerId?.toString(),
    };
  } catch (error: any) {
    console.error(`Error in gethouseById for ${houseId}:`, error);
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
  } catch (error: any) {
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
      favorites: favorites as any[],
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error: any) {
    throw error;
  }
}

export async function removefavorite(userId: string, houseId: string) {
  try {
    await dbConnect();

    return await favorite.findOneAndDelete({ userId, houseId });
  } catch (error: any) {
    throw error;
  }
}

export async function getfavoritesCount(clerkId: string): Promise<number> {
  try {
    await dbConnect();

    const user = await User.findOne({ clerkId });
    if (!user) return 0;

    return await favorite.countDocuments({ userId: user._id });
  } catch (error: any) {
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
  } catch (error: any) {
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
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return {
      pendings: pendings as any[],
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error: any) {
    throw error;
  }
}
export async function getPendingCount(clerkId: string): Promise<number> {
  try {
    await dbConnect();

    const user = await User.findOne({ clerkId });
    if (!user) return 0;

    return await Pending.countDocuments({ ownerId: user._id, status: "pending" });
  } catch (error: any) {
    throw error;
  }
}

export async function getPendingByhouse(houseId: string) {
  try {
    await dbConnect();
    return await Pending.find({ houseId }).populate("buyerId");
  } catch (error: any) {
    throw error;
  }
}

export async function getPendingByBuyerHouse(buyerId: string, houseId: string) {
  try {
    await dbConnect();

    // return a single pending matching buyer + house with status 'pending'
    return await Pending.findOne({ buyerId, houseId, status: "pending" });
  } catch (error: any) {
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
      pendings: pendings as any[],
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error: any) {
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

    if ((pending as any).status === status) {
      return pending;
    }

    const updated = await Pending.findByIdAndUpdate(
      pendingId,
      { status },
      { new: true }
    );
    return updated;
  } catch (error: any) {
    throw error;
  }
}

export async function deletePending(pendingId: string) {
  try {
    await dbConnect();
    return await Pending.findByIdAndDelete(pendingId);
  } catch (error: any) {
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
    });
  } catch (error: any) {
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
  } catch (error: any) {
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
    const h = await house.findById(houseId).select("available").lean();
    if (!h || (h as any).available === false) {
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
  } catch (error: any) {
    console.error("Error in isHouseAvailable:", error);
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
      listedMap[(h as any)._id.toString()] = (h as any).available !== false;
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
  } catch (error: any) {
    console.error("Error in batchIsHouseAvailable:", error);
    // Return empty results or default to available
    const fallback: Record<string, boolean> = {};
    houseIds.forEach((id) => (fallback[id] = true));
    return fallback;
  }
}
