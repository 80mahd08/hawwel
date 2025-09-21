"use client";
import { useFavCount } from "@/context/FavCountProvider";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Swal from "sweetalert2"; // <-- Add this import

export default function SignedInContent({
  role,
  setRole,
  loadingRole,
  setLoadingRole,
}: any) {
  const { user } = useUser();
  const pathname = usePathname();
  const iconSize = 30;
  const { count: numberOfFavorites } = useFavCount();

  useEffect(() => {
    if (user) {
      const fetchRole = async () => {
        try {
          const response = await fetch(`/api/get-user?userId=${user.id}`, {
            method: "GET",
          });
          const data = await response.json();
          setRole(data.user.role);
        } catch (error) {
          console.error("Error fetching role:", error);
        } finally {
          setLoadingRole(false);
        }
      };
      fetchRole();
    }
  }, [user, setRole, setLoadingRole]);

  const handleChangeRole = async () => {
    try {
      // Send user.id in the POST body
      const response = await fetch("/api/change-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await response.json();
      setRole(data.user.role);
      Swal.fire({
        icon: "success",
        title: "Role changed!",
        text: `Your new role is: ${data.user.role}`,
      });
    } catch (error) {
      console.error("Error changing role:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to change role. Please try again.",
      });
    }
  };
  return (
    <div className="on-sign-in">
      {!loadingRole && role !== "PROPRIETAIRE" && (
        <div className="user-change-role">
          <button className="btn" onClick={handleChangeRole}>
            change role
          </button>
        </div>
      )}

      <nav>
        <ul>
          {role === "PROPRIETAIRE" && (
            <>
              <li>
                <Link
                  className={pathname === "/add-maison" ? "active" : ""}
                  href={"/add-maison"}
                  data-tooltip="Add Maison"
                >
                  <Image
                    src={"/house-plus.svg"}
                    width={iconSize}
                    height={iconSize}
                    alt="See Favorites"
                  />
                </Link>
              </li>
              <li>
                <Link
                  className={pathname === "/my-maisons" ? "active" : ""}
                  href={"/my-maisons"}
                  data-tooltip="My Maisons"
                >
                  <Image
                    src={"/house.svg"}
                    width={iconSize}
                    height={iconSize}
                    alt="See Favorites"
                  />
                </Link>
              </li>
            </>
          )}
          <li>
            <Link
              className={pathname === "/see-favorites" ? "active" : ""}
              href={"/see-favorites"}
              data-tooltip="See Favorites"
            >
              <Image
                src={"/heart.svg"}
                width={iconSize}
                height={iconSize}
                alt="See Favorites"
              />
              <span className="badge">{numberOfFavorites}</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="user-name">
        <span>hi, {user?.firstName || user?.username || "User"}!</span>
      </div>
      <div className="user-image">
        <UserButton />
      </div>
    </div>
  );
}
