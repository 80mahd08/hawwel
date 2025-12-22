import { getPendingByOwner, getUserByClerkId } from "@/lib/dbFunctions";
import { currentUser } from "@clerk/nextjs/server";
import MyPendingClient from "./MyPendingClient";

// Local interface for IPC
interface IPendingRequest {
  _id: string;
  ownerId: string;
  buyerId: string | { _id: string; name?: string; imageUrl?: string };
  houseId: { _id: string; title: string; images: string[] };
  startDate: Date;
  endDate: Date;
  createdAt: string;
}

// Local interface for mongoUser
interface IMongoUser {
  _id: string;
  clerkId: string;
  name: string;
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

  const { pendings, totalPages, currentPage } = await getPendingByOwner(
    mongoUser._id.toString(),
    page,
    limit
  );

  return (
    <MyPendingClient 
        pendings={JSON.parse(JSON.stringify(pendings)) as IPendingRequest[]}
        totalPages={totalPages}
        currentPage={currentPage}
        mongoUser={JSON.parse(JSON.stringify(mongoUser)) as IMongoUser}
    />
  );
}
