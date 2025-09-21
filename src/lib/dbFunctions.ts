import dbConnect from "./dbConnect";
import User, { IUser } from "@/models/User";
import Maison, { IMaison } from "@/models/Maison";
import Favori from "@/models/Favori";
import Avis from "@/models/Avis";
import { Types } from "mongoose";

// ------------------
// USER FUNCTIONS
// ------------------
type UserInput = Omit<IUser, "_id" | "createdAt" | "updatedAt">;

export async function createUser(userData: UserInput) {
  try {
    await dbConnect();
    console.log("📤 Creating user with data:", userData);
    const user = await User.create(userData);
    console.log("✅ User created:", user);
    return user;
  } catch (error) {
    console.error("❌ Error in createUser:", error);
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    await dbConnect();
    console.log("🔍 Finding user by clerkId:", clerkId);
    return await User.findOne({ clerkId });
  } catch (error) {
    console.error("❌ Error in getUserByClerkId:", error);
    throw error;
  }
}

export async function updateUserByClerkId(
  clerkId: string,
  updateData: Partial<IUser>
) {
  try {
    await dbConnect();
    console.log("🛠 Updating user", clerkId, "with", updateData);
    return await User.findOneAndUpdate({ clerkId }, updateData, { new: true });
  } catch (error) {
    console.error("❌ Error in updateUserByClerkId:", error);
    throw error;
  }
}

export async function deleteUserByClerkId(clerkId: string) {
  try {
    await dbConnect();
    console.log("🗑 Deleting user by clerkId:", clerkId);
    return await User.findOneAndDelete({ clerkId });
  } catch (error) {
    console.error("❌ Error in deleteUserByClerkId:", error);
    throw error;
  }
}

export async function updateRoleToProprietaire(clerkId: string) {
  try {
    await dbConnect();
    console.log("🛠 Updating user", clerkId, "to PROPRIETAIRE");
    return await User.findOneAndUpdate(
      { clerkId },
      { role: "PROPRIETAIRE" },
      { new: true }
    );
  } catch (error) {
    console.error("❌ Error in updateRoleToProprietaire:", error);
    throw error;
  }
}

// ------------------
// MAISON FUNCTIONS
// ------------------
export async function createMaison(maisonData: IMaison) {
  try {
    await dbConnect();
    console.log("🏠 Creating maison:", maisonData);
    return await Maison.create(maisonData);
  } catch (error) {
    console.error("❌ Error in createMaison:", error);
    throw error;
  }
}

export async function getAllMaisons() {
  try {
    await dbConnect();
    console.log("📦 Getting all maisons...");
    return await Maison.find({});
  } catch (error) {
    console.error("❌ Error in getAllMaisons:", error);
    throw error;
  }
}

export async function getMaisonsByOwner(userId: Types.ObjectId) {
  try {
    await dbConnect();
    console.log("🏘 Getting maisons for owner:", userId);
    return await Maison.find({ ownerId: userId });
  } catch (error) {
    console.error("❌ Error in getMaisonsByOwner:", error);
    throw error;
  }
}

export async function deleteMaison(maisonId: Types.ObjectId) {
  try {
    await dbConnect();
    console.log("🗑 Deleting maison:", maisonId);
    return await Maison.findByIdAndDelete(maisonId);
  } catch (error) {
    console.error("❌ Error in deleteMaison:", error);
    throw error;
  }
}

export async function getMaisonById(maisonId: string) {
  try {
    await dbConnect();
    if (!maisonId) {
      throw new Error("Maison ID is required");
    }
    const maisonObjectId = new Types.ObjectId(maisonId);

    console.log("🔍 Finding maison by id:", maisonId);
    return await Maison.findById(maisonObjectId);
  } catch (error) {
    console.error("❌ Error in getMaisonById:", error);
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
    // Check if the favorite already exists
    const existing = await Favori.findOne({ userId, maisonId });
    if (existing) {
      // Optionally, you can throw an error or just return the existing favorite
      return existing;
    }
    console.log("❤️ Adding favori: user", userId, "maison", maisonId);
    return await Favori.create({ userId, maisonId });
  } catch (error) {
    console.error("❌ Error in addFavori:", error);
    throw error;
  }
}

export async function getUserFavoris(userId: Types.ObjectId) {
  try {
    await dbConnect();
    console.log("📚 Getting favoris for user:", userId);
    return await Favori.find({ userId }).populate("maisonId");
  } catch (error) {
    console.error("❌ Error in getUserFavoris:", error);
    throw error;
  }
}

export async function removeFavori(
  userId: Types.ObjectId,
  maisonId: Types.ObjectId
) {
  try {
    await dbConnect();
    console.log("💔 Removing favori: user", userId, "maison", maisonId);
    return await Favori.findOneAndDelete({ userId, maisonId });
  } catch (error) {
    console.error("❌ Error in removeFavori:", error);
    throw error;
  }
}

export async function getFavoritesCount(clerkId: string): Promise<number> {
  try {
    await dbConnect();
    // Find the user by Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) return 0;
    // Count the number of Favori documents for this user
    const count = await Favori.find({ userId: user._id });

    return count.length;
  } catch (error) {
    console.error("❌ Error in getFavoritesCount:", error);
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
    console.log("📝 Adding avis from user", userId, "to maison", maisonId);
    return await Avis.create({
      userId,
      maisonId,
      comment,
      rating,
      datePosted: new Date(),
    });
  } catch (error) {
    console.error("❌ Error in addAvis:", error);
    throw error;
  }
}

export async function getMaisonAvis(maisonId: Types.ObjectId) {
  try {
    await dbConnect();
    console.log("📑 Getting avis for maison:", maisonId);
    return await Avis.find({ maisonId }).populate("userId");
  } catch (error) {
    console.error("❌ Error in getMaisonAvis:", error);
    throw error;
  }
}

export async function removeAvis(avisId: string) {
  try {
    await dbConnect();
    return await Avis.findByIdAndDelete(avisId);
  } catch (error) {
    console.error("❌ Error in removeAvis:", error);
    throw error;
  }
}
