import dbConnect from "./dbConnect";
import User, { IUser } from "@/models/User";
import Maison, { IMaison } from "@/models/Maison";
import Favori from "@/models/Favori";
import Avis from "@/models/Avis";
import { Types } from "mongoose";
import logger from "../../services/logger";

// ------------------
// USER FUNCTIONS
// ------------------
type UserInput = Omit<IUser, "_id" | "createdAt" | "updatedAt">;

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

export async function updateRoleToProprietaire(clerkId: string) {
  try {
    await dbConnect();
    logger.info("🛠 Updating role to PROPRIETAIRE", { clerkId });
    return await User.findOneAndUpdate(
      { clerkId },
      { role: "PROPRIETAIRE" },
      { new: true }
    );
  } catch (error: any) {
    logger.error("❌ Error in updateRoleToProprietaire", {
      clerkId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// ------------------
// MAISON FUNCTIONS
// ------------------
export async function createMaison(maisonData: IMaison) {
  try {
    await dbConnect();
    logger.info("🏠 Creating maison", {
      ownerId: maisonData.ownerId,
      title: maisonData.title,
    });
    return await Maison.create(maisonData);
  } catch (error: any) {
    logger.error("❌ Error in createMaison", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getAllMaisons() {
  try {
    await dbConnect();
    logger.info("📦 Getting all maisons");
    return await Maison.find({});
  } catch (error: any) {
    logger.error("❌ Error in getAllMaisons", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getMaisonsByOwner(userId: Types.ObjectId) {
  try {
    await dbConnect();
    logger.info("🏘 Getting maisons for owner", { userId });
    return await Maison.find({ ownerId: userId });
  } catch (error: any) {
    logger.error("❌ Error in getMaisonsByOwner", {
      userId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function deleteMaison(maisonId: Types.ObjectId) {
  try {
    await dbConnect();
    logger.info("🗑 Deleting maison", { maisonId });
    return await Maison.findByIdAndDelete(maisonId);
  } catch (error: any) {
    logger.error("❌ Error in deleteMaison", {
      maisonId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getMaisonById(maisonId: string) {
  try {
    await dbConnect();
    if (!maisonId) throw new Error("Maison ID is required");
    const maisonObjectId = new Types.ObjectId(maisonId);
    logger.info("🔍 Finding maison by id", { maisonId });
    return await Maison.findById(maisonObjectId);
  } catch (error: any) {
    logger.error("❌ Error in getMaisonById", {
      maisonId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// ------------------
// FAVORI FUNCTIONS
// ------------------
export async function addFavori(
  userId: Types.ObjectId,
  maisonId: Types.ObjectId
) {
  try {
    await dbConnect();
    const existing = await Favori.findOne({ userId, maisonId });
    if (existing) return existing;

    logger.info("❤️ Adding favori", { userId, maisonId });
    return await Favori.create({ userId, maisonId });
  } catch (error: any) {
    logger.error("❌ Error in addFavori", {
      userId,
      maisonId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getUserFavoris(userId: Types.ObjectId) {
  try {
    await dbConnect();
    logger.info("📚 Getting favoris for user", { userId });
    return await Favori.find({ userId }).populate("maisonId");
  } catch (error: any) {
    logger.error("❌ Error in getUserFavoris", {
      userId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function removeFavori(
  userId: Types.ObjectId,
  maisonId: Types.ObjectId
) {
  try {
    await dbConnect();
    logger.info("💔 Removing favori", { userId, maisonId });
    return await Favori.findOneAndDelete({ userId, maisonId });
  } catch (error: any) {
    logger.error("❌ Error in removeFavori", {
      userId,
      maisonId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getFavoritesCount(clerkId: string): Promise<number> {
  try {
    await dbConnect();
    const user = await User.findOne({ clerkId });
    if (!user) return 0;

    const count = await Favori.find({ userId: user._id });
    logger.info("🔢 Favorites count", {
      clerkId,
      favorites: count.length,
    });
    return count.length;
  } catch (error: any) {
    logger.error("❌ Error in getFavoritesCount", {
      clerkId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// ------------------
// AVIS FUNCTIONS
// ------------------
export async function addAvis(
  userId: Types.ObjectId,
  maisonId: Types.ObjectId,
  comment: string,
  rating: number
) {
  try {
    await dbConnect();
    logger.info("📝 Adding avis", { userId, maisonId, rating });
    return await Avis.create({
      userId,
      maisonId,
      comment,
      rating,
      datePosted: new Date(),
    });
  } catch (error: any) {
    logger.error("❌ Error in addAvis", {
      userId,
      maisonId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getMaisonAvis(maisonId: Types.ObjectId) {
  try {
    await dbConnect();
    logger.info("📑 Getting avis for maison", { maisonId });
    return await Avis.find({ maisonId }).populate("userId");
  } catch (error: any) {
    logger.error("❌ Error in getMaisonAvis", {
      maisonId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function removeAvis(avisId: string) {
  try {
    await dbConnect();
    logger.info("🗑 Removing avis", { avisId });
    return await Avis.findByIdAndDelete(avisId);
  } catch (error: any) {
    logger.error("❌ Error in removeAvis", {
      avisId,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
