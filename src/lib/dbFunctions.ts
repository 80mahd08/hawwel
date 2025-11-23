// ============================================
// Imports
// ============================================
import dbConnect from "./dbConnect";
import logger from "../../services/logger";

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
    logger.info("📤 Creating user", { clerkId: userData.clerkId });

    const user = await User.create(userData);
    logger.info("✅ User created", { userId: user._id });
    return user;
  } catch (error: any) {
    logger.error("❌ Error in createUser", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    await dbConnect();
    logger.info("🔍 Finding user by clerkId", { clerkId });

    return await User.findOne({ clerkId });
  } catch (error: any) {
    logger.error("❌ Error in getUserByClerkId", {
      clerkId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getUserById(userId: string) {
  try {
    await dbConnect();
    logger.info("🔍 Finding user by id", { userId });
    return await User.findById(userId);
  } catch (error: any) {
    logger.error("❌ Error in getUserById", {
      userId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
export async function updateUserByClerkId(
  clerkId: string,
  updateData: Partial<IUser>
) {
  try {
    await dbConnect();
    logger.info("🛠 Updating user", { clerkId, updateData });

    return await User.findOneAndUpdate({ clerkId }, updateData, { new: true });
  } catch (error: any) {
    logger.error("❌ Error in updateUserByClerkId", {
      clerkId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function deleteUserByClerkId(clerkId: string) {
  try {
    await dbConnect();
    logger.info("🗑 Deleting user", { clerkId });

    return await User.findOneAndDelete({ clerkId });
  } catch (error: any) {
    logger.error("❌ Error in deleteUserByClerkId", {
      clerkId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function updateRoleToOwner(clerkId: string) {
  try {
    await dbConnect();
    logger.info("🛠 Updating role to OWNER", { clerkId });

    return await User.findOneAndUpdate(
      { clerkId },
      { role: "OWNER" },
      { new: true }
    );
  } catch (error: any) {
    logger.error("❌ Error in updateRoleToOwner", {
      clerkId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// ============================================
// HOUSE FUNCTIONS
// ============================================
export async function createhouse(houseData: Ihouse) {
  try {
    await dbConnect();
    logger.info("🏠 Creating house", {
      ownerId: houseData.ownerId,
      title: houseData.title,
    });

    return await house.create(houseData);
  } catch (error: any) {
    logger.error("❌ Error in createhouse", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getAllhouses() {
  try {
    await dbConnect();
    logger.info("📦 Getting all houses");

    return await house.find({});
  } catch (error: any) {
    logger.error("❌ Error in getAllhouses", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function gethousesByOwner(userId: string) {
  try {
    await dbConnect();
    logger.info("🏘 Getting houses for owner", { userId });

    return await house.find({ ownerId: userId });
  } catch (error: any) {
    logger.error("❌ Error in gethousesByOwner", {
      userId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function gethouseById(houseId: string) {
  try {
    await dbConnect();
    if (!houseId) throw new Error("house ID is required");

    logger.info("🔍 Finding house by id", { houseId });

    const result = await house.findById(houseId);

    return result;
  } catch (error: any) {
    logger.error("❌ Error in gethouseById", {
      houseId,
      message: error.message,
      stack: error.stack,
    });
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

    logger.info("❤️ Adding favorite", { userId, houseId });
    const newFav = await favorite.create({ userId, houseId });
    return { favorite: newFav, alreadyExists: false };
  } catch (error: any) {
    logger.error("❌ Error in addfavorite", {
      userId,
      houseId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getUserfavorites(userId: string) {
  try {
    await dbConnect();
    logger.info("📚 Getting favorites for user", { userId });

    return await favorite.find({ userId }).populate("houseId");
  } catch (error: any) {
    logger.error("❌ Error in getUserfavorites", {
      userId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function removefavorite(userId: string, houseId: string) {
  try {
    await dbConnect();
    logger.info("💔 Removing favorite", { userId, houseId });

    return await favorite.findOneAndDelete({ userId, houseId });
  } catch (error: any) {
    logger.error("❌ Error in removefavorite", {
      userId,
      houseId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getfavoritesCount(clerkId: string): Promise<number> {
  try {
    await dbConnect();

    const user = await User.findOne({ clerkId });
    if (!user) return 0;

    const count = await favorite.find({ userId: user._id });
    logger.info("🔢 favorites count", { clerkId, count: count.length });

    return count.length;
  } catch (error: any) {
    logger.error("❌ Error in getfavoritesCount", {
      clerkId,
      message: error.message,
      stack: error.stack,
    });
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
}: {
  buyerId: string;
  ownerId: string;
  houseId: string;
}) {
  try {
    await dbConnect();

    logger.info("🕒 Creating pending request", {
      buyerId,
      ownerId,
      houseId,
    });

    const existing = await Pending.findOne({
      buyerId,
      houseId,
      ownerId,
      status: "pending",
    });

    if (existing) {
      logger.info("⚠️ Pending already exists", {
        pendingId: existing._id,
      });
      return existing;
    }

    const pending = await Pending.create({ buyerId, ownerId, houseId });

    logger.info("✅ Pending created successfully", {
      pendingId: pending._id,
    });

    return pending;
  } catch (error: any) {
    logger.error("❌ Error creating pending", {
      buyerId,
      ownerId,
      houseId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getPendingByOwner(ownerId: string) {
  try {
    await dbConnect();
    logger.info("🔍 Getting pending requests for owner", { ownerId });

    return await Pending.find({ ownerId, status: "pending" });
  } catch (error: any) {
    logger.error("❌ Error in getPendingByOwner", {
      ownerId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
export async function getPendingCount(clerkId: string): Promise<number> {
  try {
    await dbConnect();

    const user = await User.findOne({ clerkId });
    if (!user) return 0;

    const count = await Pending.find({ ownerId: user._id, status: "pending" });
    logger.info("🔢 pending count", { clerkId, count: count.length });
    return count.length;
  } catch (error: any) {
    logger.error("❌ Error in getPendingCount", {
      clerkId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getPendingByhouse(houseId: string) {
  try {
    await dbConnect();
    logger.info("🔍 Getting pending requests for house", { houseId });

    return await Pending.find({ houseId }).populate("buyerId");
  } catch (error: any) {
    logger.error("❌ Error in getPendingByhouse", {
      houseId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getPendingByBuyerHouse(buyerId: string, houseId: string) {
  try {
    await dbConnect();
    logger.info("🔍 Getting pending by buyer + house", { buyerId, houseId });

    // return a single pending matching buyer + house with status 'pending'
    return await Pending.findOne({ buyerId, houseId, status: "pending" });
  } catch (error: any) {
    logger.error("❌ Error in getPendingByBuyerHouse", {
      buyerId,
      houseId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function updatePendingStatus(
  pendingId: string,
  status: "pending" | "approved" | "rejected"
) {
  try {
    await dbConnect();
    logger.info("🔁 Updating pending status", { pendingId, status });

    const pending = await Pending.findById(pendingId);
    if (!pending) {
      logger.warn("Pending not found", { pendingId });
      throw new Error("Pending not found");
    }

    if ((pending as any).status === status) {
      logger.info("Pending already has the requested status", {
        pendingId,
        status,
      });
      return pending;
    }

    const updated = await Pending.findByIdAndUpdate(
      pendingId,
      { status },
      { new: true }
    );

    logger.info("✅ Pending status updated", {
      pendingId,
      oldStatus: (pending as any).status,
      newStatus: status,
    });

    return updated;
  } catch (error: any) {
    logger.error("❌ Error in updatePendingStatus", {
      pendingId,
      status,
      message: error?.message,
      stack: error?.stack,
    });
    throw error;
  }
}

export async function deletePending(pendingId: string) {
  try {
    await dbConnect();
    logger.info("🗑 Deleting pending request", { pendingId });

    return await Pending.findByIdAndDelete(pendingId);
  } catch (error: any) {
    logger.error("❌ Error in deletePending", {
      pendingId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
