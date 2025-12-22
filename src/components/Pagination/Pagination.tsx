"use client";

import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({
  totalPages,
  currentPage,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        &lt;
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          className={`page-btn ${currentPage === page ? "active" : ""}`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        &gt;
      </button>
    </div>
  );
}
