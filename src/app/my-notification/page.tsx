import { getPendingByBuyer, getUserByClerkId } from "@/lib/dbFunctions";
import { currentUser } from "@clerk/nextjs/server";
import DispNotification from "@/components/DispNotification/DispNotification";

export default async function page() {
  const user = await currentUser();
  if (!user) {
    return <div>Unauthorized</div>;
  }
  const mongoUser = await getUserByClerkId(user.id);
  if (!mongoUser) {
    return <div>User not found.</div>;
  }

  const pendings = await getPendingByBuyer(mongoUser._id.toString());

  if (pendings) {
    return (
      <div className="container my-notification">
        {pendings.map((pending) => (
          <DispNotification key={pending._id} pending={pending} />
        ))}
      </div>
    );
  }
  return <div>No pending requests found.</div>;
}
