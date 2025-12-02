"use client";

import { useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Swal from "sweetalert2";
import { useFavCount } from "@/context/FavCountProvider";
import { usePendingCount } from "@/context/PendingCountProvider";
import { useNotificationCount } from "@/context/NotificationCountProvider";

interface SignedInContentProps {
  role: string;
  setRole: (role: string) => void;
  loadingRole: boolean;
  setLoadingRole: (loading: boolean) => void;
}

export default function SignedInContent({
  role,
  setRole,
  loadingRole,
  setLoadingRole,
}: SignedInContentProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const { count: favoritesCount } = useFavCount();
  const { count: pendingCount, refreshCountPending } = usePendingCount();
  const { count: notificationCount, refreshCountNotification } =
    useNotificationCount();
  const iconSize = 30;
  useEffect(() => {
    refreshCountPending(user?.id);
    refreshCountNotification(user?.id);
  }, [pathname]);
  useEffect(() => {
    if (!user) return;

    const fetchUserRole = async () => {
      try {
        const response = await fetch(`/api/get-user?userId=${user.id}`);
        const data = await response.json();

        if (!data.user?.role) throw new Error("Role not found");

        setRole(data.user.role);
      } catch (error) {
        console.error("Error fetching role:", error);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchUserRole();
  }, [user, setRole, setLoadingRole]);

  const handleRoleSwitch = async () => {
    try {
      const response = await fetch("/api/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await response.json();

      if (!data.user) throw new Error("User not found or role not updated.");

      setRole(data.user.role);

      Swal.fire({
        icon: "success",
        title: "Role Updated",
        text: `Your new role is: ${data.user.role}`,
      });
    } catch (error) {
      console.error("Error changing role:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Unable to change role. Please try again later.",
      });
    }
  };

  return (
    <div className="on-sign-in">
      {!loadingRole && role !== "OWNER" && (
        <div className="user-role-switch">
          <button className="btn" onClick={handleRoleSwitch}>
            Switch Role
          </button>
        </div>
      )}

      <nav>
        <ul>
          {role === "OWNER" && (
            <>
              <li>
                <Link
                  href="/add-house"
                  className={pathname === "/add-house" ? "active" : ""}
                  data-tooltip="Add house"
                >
                  <Image
                    src="/house-plus.svg"
                    width={iconSize}
                    height={iconSize}
                    alt="Add house"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="/my-houses"
                  className={pathname === "/my-houses" ? "active" : ""}
                  data-tooltip="Your houses"
                >
                  <Image
                    src="/house.svg"
                    width={iconSize}
                    height={iconSize}
                    alt="Your houses"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="/my-pending"
                  className={pathname === "/my-pending" ? "active" : ""}
                  data-tooltip="Your pending"
                >
                  <Image
                    src="/pending.svg"
                    width={iconSize}
                    height={iconSize}
                    alt="My pending"
                  />
                  <span className="badge">{pendingCount}</span>
                </Link>
              </li>
            </>
          )}

          <li>
            <Link
              href="/see-favorites"
              className={pathname === "/see-favorites" ? "active" : ""}
              data-tooltip="See favorites"
            >
              <Image
                src="/heart.svg"
                width={iconSize}
                height={iconSize}
                alt="See favorites"
              />
              <span className="badge">{favoritesCount}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/my-notification"
              className={pathname === "/my-notification" ? "active" : ""}
              data-tooltip="Your notifications"
            >
              <Image
                src="/notification.svg"
                width={iconSize}
                height={iconSize}
                alt="Your notifications"
              />
              <span className="badge">{notificationCount}</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="user-name">
        <span>Hello, {user?.firstName || user?.username || "User"}!</span>
      </div>

      <div className="user-avatar">
        <UserButton />
      </div>
    </div>
  );
}
