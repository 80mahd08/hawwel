"use client";

import { useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Link, usePathname } from "@/i18n/routing";
import Image from "next/image";
import Swal from "sweetalert2";
import { useFavCount } from "@/context/FavCountProvider";
import { usePendingCount } from "@/context/PendingCountProvider";
import { useNotificationCount } from "@/context/NotificationCountProvider";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('Navigation');

  useEffect(() => {
    if (!user?.id) return;
    refreshCountPending(user.id);
    refreshCountNotification(user.id);
  }, [user?.id, refreshCountPending, refreshCountNotification]);
  useEffect(() => {
    if (!user) return;

    const fetchUserRole = async () => {
      try {
        const response = await fetch(`/api/get-user?userId=${user.id}`);
        const data = await response.json();

        if (!data.user?.role) throw new Error("Role not found");

        setRole(data.user.role);
      } catch {
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
    } catch {
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
            {t('switchRole')}
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
                  data-tooltip={t('addHouse')}
                >
                  <Image
                    src="/house-plus.svg"
                    width={iconSize}
                    height={iconSize}
                    alt={t('addHouse')}
                  />
                  <span className="nav-label">{t('addHouse')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/my-houses"
                  className={pathname === "/my-houses" ? "active" : ""}
                  data-tooltip={t('myHouses')}
                >
                  <Image
                    src="/house.svg"
                    width={iconSize}
                    height={iconSize}
                    alt={t('myHouses')}
                  />
                  <span className="nav-label">{t('myHouses')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/my-pending"
                  className={pathname === "/my-pending" ? "active" : ""}
                  data-tooltip={t('pending')}
                >
                  <Image
                    src="/pending.svg"
                    width={iconSize}
                    height={iconSize}
                    alt={t('pending')}
                  />
                  <span className="badge">{pendingCount}</span>
                  <span className="nav-label">{t('pending')}</span>
                </Link>
              </li>
            </>
          )}

          <li>
            <Link
              href="/see-favorites"
              className={pathname === "/see-favorites" ? "active" : ""}
              data-tooltip={t('favorites')}
            >
              <Image
                src="/heart.svg"
                width={iconSize}
                height={iconSize}
                alt={t('favorites')}
              />
              <span className="badge">{favoritesCount}</span>
              <span className="nav-label">{t('favorites')}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/my-notification"
              className={pathname === "/my-notification" ? "active" : ""}
              data-tooltip={t('notifications')}
            >
              <Image
                src="/notification.svg"
                width={iconSize}
                height={iconSize}
                alt={t('notifications')}
              />
              <span className="badge">{notificationCount}</span>
              <span className="nav-label">{t('notifications')}</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="user-name">
        <span>{t('hello')}, {user?.firstName || user?.username || "User"}!</span>
      </div>

      <div className="user-avatar">
        <UserButton />
      </div>
    </div>
  );
}
