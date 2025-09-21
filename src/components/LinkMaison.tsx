"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RemFavBtn from "./RemFavBtn";
import FavBtn from "./FavBtn";
import RemMaisonBtn from "./RemMaisonBtn";
import { useUser } from "@clerk/nextjs";

export type LinkMaisonProps = {
  _id?: string;
  title: string;
  location: string;
  pricePerDay: number;
  images: string[];
};

export default function LinkMaison({ maison }: { maison: LinkMaisonProps }) {
  const pathname = usePathname();
  const { user } = useUser();
  return (
    <div className="maison-link-container">
      <Link href={`/${maison._id}`}>
        <div className="text">
          <h2>{maison.title}</h2>

          <p>{maison.location}</p>
          <p style={{ display: "flex", justifyContent: "flex-end" }}>
            <strong style={{ fontSize: "2rem" }}>
              DT {maison.pricePerDay}
            </strong>
          </p>
        </div>

        <div className="image">
          {maison.images.length > 0 && (
            <img
              src={maison.images[0]}
              alt={maison.title}
              className="maison-image"
            />
          )}
        </div>
      </Link>
      {user?.id && (
        <div className="btn-container">
          {pathname === "/see-favorites" ? (
            <RemFavBtn maisonId={maison._id as string} />
          ) : (
            <FavBtn maisonId={maison._id as string} />
          )}
          {pathname === "/my-maisons" ? (
            <RemMaisonBtn maisonId={maison._id as string} />
          ) : null}
        </div>
      )}
    </div>
  );
}
