import { getPendingByBuyer, getUserByClerkId } from "@/lib/dbFunctions";
import { currentUser } from "@clerk/nextjs/server";
import DispNotification from "@/components/DispNotification/DispNotification";
import ClearAllNotificationsBtn from "@/components/DispNotification/components/ClearAllNotificationsBtn";
import Pagination from "@/components/Pagination/Pagination";

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

  if (pendings && pendings.length > 0) {
    return (
      <div className="container my-notification">
        <ClearAllNotificationsBtn />
        {pendings.map((pending) => (
          <DispNotification key={pending._id} pending={pending} />
        ))}
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    );
  }
  return <div style={{ textAlign: "center" }}>No pending requests found.</div>;
}
