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

export async function getAllhouses() {
  try {
    await dbConnect();

    return await house.find({});
  } catch (error: any) {
    throw error;
  }
}

export async function gethousesByOwner(userId: string) {
  try {
    await dbConnect();

    return await house.find({ ownerId: userId });
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

export async function getUserfavorites(userId: string) {
  try {
    await dbConnect();

    return await favorite.find({ userId }).populate("houseId");
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

export async function getPendingByOwner(ownerId: string) {
  try {
    await dbConnect();
    return await Pending.find({ ownerId, status: "pending" });
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

export async function getPendingByBuyer(buyerId: string) {
  try {
    await dbConnect();

    return await Pending.find({ buyerId, status: { $ne: "pending" } });
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
