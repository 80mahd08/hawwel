import { gethouseById, getUserByClerkId, getUserById } from "@/lib/dbFunctions";
import logger from "../../../services/logger";
import Image from "next/image";
import BtnAccept from "./components/BtnAccept";
import BtnRefuse from "./components/BtnRefuse";

export default async function DispPending({
  pending,
}: {
  pending: {
    _id: string;
    ownerId: string;
    buyerId: string;
    houseId: string;
    createdAt: string;
  };
}) {
  logger.info("Rendering pending item", {
    pendingId: pending._id,
    houseId: pending.houseId,
    buyerId: pending.buyerId,
  });
  const house = await gethouseById(pending.houseId);

  logger.info("Fetched house for pending item", {
    pendingId: pending._id,
    houseTitle: house?.title,
  });

  const buyer = await getUserById(pending.buyerId);

  logger.info("Fetched buyer for pending item", {
    pendingId: pending._id,
    buyerName: buyer?.name,
  });

  if (!house || !buyer) {
    logger.error("House or buyer not found for pending item", {
      pendingId: pending._id,
      houseId: pending.houseId,
      buyerId: pending.buyerId,
    });
    return null;
  }
  logger.info("Pending item rendered successfully", { pendingId: pending._id });

  return (
    <div className="pending-item">
      <div className="image">
        {house.images && house.images.length > 0 ? (
          <Image
            src={house.images[0]}
            alt={house.title}
            width={200}
            height={150}
          />
        ) : (
          <Image
            src="/placeholder.png"
            alt="placeholder"
            width={200}
            height={150}
          />
        )}
      </div>
      <div className="content">
        <h3>buyer name: {buyer.name}</h3>
        <p>house title: {house.title}</p>
      </div>
      <div className="btns">
        <BtnRefuse pendingId={pending._id} />
        <BtnAccept pendingId={pending._id} houseId={pending.houseId} />
      </div>
    </div>
  );
}
