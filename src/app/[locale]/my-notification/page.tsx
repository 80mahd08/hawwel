import { getPendingByBuyer, getUserByClerkId } from "@/lib/dbFunctions";
import { currentUser } from "@clerk/nextjs/server";
import MyNotificationClient from "./MyNotificationClient";

// Local interface for IPC
interface IPendingNotification {
  _id: string;
  ownerId: string;
  buyerId: string;
  houseId: {
    _id: string;
    title: string;
    images: string[];
    telephone?: string;
  };
  status: string;
  createdAt: string;
  startDate: string;
  endDate: string;
}

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await currentUser();
  if (!user) {
    return <div>Unauthorized</div>;
  }
  const mongoUser = await getUserByClerkId(user.id);
  if (!mongoUser) {
    return <div>User not found.</div>;
  }

  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page as string)
    : 1;
  const limit = 9;

  const { pendings, totalPages, currentPage } = await getPendingByBuyer(
    mongoUser._id.toString(),
    page,
    limit
  );

  return (
    <MyNotificationClient 
        pendings={JSON.parse(JSON.stringify(pendings)) as IPendingNotification[]} 
        totalPages={totalPages} 
        currentPage={currentPage} 
    />
  );
}
