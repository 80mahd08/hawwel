// ============================================
// Imports
// ============================================
import dbConnect from "./dbConnect";

import User, { IUser } from "@/models/User";
import house, { Ihouse } from "@/models/house";
import favorite from "@/models/favorite";
import Pending from "@/models/Pending";

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

export async function getAllhouses(filters: {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
} = {}) {
  try {
    await dbConnect();

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Number(filters.limit) || 9);
    const skip = (page - 1) * limit;

    console.log(`getAllhouses: page=${page}, limit=${limit}, skip=${skip}`);

    const query: any = {};

    if (filters.location) {
      query.location = { $regex: filters.location, $options: "i" };
    }

    if (filters.minPrice || filters.maxPrice) {
      query.pricePerDay = {};
      if (filters.minPrice) query.pricePerDay.$gte = filters.minPrice;
      if (filters.maxPrice) query.pricePerDay.$lte = filters.maxPrice;
    }

    if (filters.amenities && filters.amenities.length > 0) {
      query.amenities = { $all: filters.amenities };
    }

    if (filters.startDate && filters.endDate) {
      const reservedHouseIds = await Pending.find({
        status: "approved",
        $or: [
          {
            startDate: { $lte: filters.endDate },
            endDate: { $gte: filters.startDate },
          },
        ],
      }).distinct("houseId");

      if (reservedHouseIds.length > 0) {
        query._id = { $nin: reservedHouseIds };
      }
    }

    const totalHouses = await house.countDocuments(query);
    const houses = await house.find(query).skip(skip).limit(limit);

    console.log(`getAllhouses: found ${houses.length} houses. Total: ${totalHouses}`);

    return {
      houses,
      totalPages: Math.ceil(totalHouses / limit),
      currentPage: page,
    };
  } catch (error: any) {
    throw error;
  }
}

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
    const total = await house.countDocuments({ ownerId: userId });
    const houses = await house
      .find({ ownerId: userId })
      .skip(skip)
      .limit(limitNum);

    console.log(`gethousesByOwner: found ${houses.length} houses. Total: ${total}`);

    return {
      houses,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    };
  } catch (error: any) {
    throw error;
  }
}

export async function gethouseById(houseId: string) {
  try {
    await dbConnect();
    if (!houseId) throw new Error("house ID is required");
    const result = await house.findById(houseId);
    return result;
  } catch (error: any) {
    throw error;
  }
}

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
    const total = await favorite.countDocuments({ userId });
    const favorites = await favorite
      .find({ userId })
      .populate("houseId")
      .skip(skip)
      .limit(limit);

    return {
      favorites,
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

    const count = await favorite.find({ userId: user._id });

    return count.length;
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
    const total = await Pending.countDocuments({ ownerId, status: "pending" });
    const pendings = await Pending.find({ ownerId, status: "pending" })
      .skip(skip)
      .limit(limit);

    return {
      pendings,
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

    const count = await Pending.find({ ownerId: user._id, status: "pending" });
    return count.length;
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
    const total = await Pending.countDocuments({
      buyerId,
      status: { $ne: "pending" },
    });
    const pendings = await Pending.find({
      buyerId,
      status: { $ne: "pending" },
    })
      .skip(skip)
      .limit(limit);

    return {
      pendings,
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

    const count = await Pending.find({
      buyerId: user._id,
      status: { $ne: "pending" },
    });
    return count.length;
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

    const today = new Date(); // current date

    return await Pending.find({
      houseId,
      status: "approved",
      endDate: { $gte: today }, // keep only future or ongoing reservations
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

    const now = new Date();

    // Create today in UTC to match your database dates
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    console.log("=== AVAILABILITY DEBUG ===");
    console.log("Today (UTC):", todayUTC.toISOString());
    console.log("Now:", now.toISOString());

    // Check if there are any approved reservations that include today
    const activeReservation = await Pending.findOne({
      houseId,
      status: "approved",
      startDate: { $lte: todayUTC }, // Reservation starts today or earlier
      endDate: { $gte: todayUTC }, // Reservation ends today or later
    });

    console.log("Active reservation found:", activeReservation);
    if (activeReservation) {
      console.log("Reservation details:", {
        startDate: activeReservation.startDate,
        endDate: activeReservation.endDate,
        startISO: activeReservation.startDate?.toISOString(),
        endISO: activeReservation.endDate?.toISOString(),
      });
    }

    // If there's an active reservation, house is NOT available
    return !activeReservation;
  } catch (error: any) {
    console.error("Error in isHouseAvailable:", error);
    return true; // Default to available if there's an error
  }
}
