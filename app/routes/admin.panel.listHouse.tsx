// app/routes/admin.panel.listHouse.tsx
/**
 * tasks:
 * [x] 検索時に、店舗名での検索・マンション名での検索、それぞれを選択してできるようにする
 */

import { useMemo, useState } from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { fetchAllHouses } from "~/lib/supabase/db";
import type { HouseWithStore } from "~/types";
import { useQueryToast } from "~/Hooks/useQueryToast";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const houses = await fetchAllHouses();
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  return { houses, status, type };
};

export default function ListHouse() {
  const { houses, status, type } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<"apartment" | "store">("apartment");
  const [sortKey, setSortKey] = useState<"apartment" | "store">("apartment");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const messages = useMemo(() => ({
    status: {
      success: {
        title: type === "delete" ? "マンションを削除しました" : "処理が成功しました",
        variant: "success" as const,
      },
      error: {
        title: "削除に失敗しました",
        variant: "error" as const,
      },
    },
  }), [type]);

  useQueryToast({
    query: { status, type },
    messages,
    basePath: "/admin/panel/listHouse",
  });

  const filteredHouses = useMemo<HouseWithStore[]>(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = houses.filter((house) => {
      if (!term) return true;
      if (searchMode === "apartment") {
        return house.apartment.toLowerCase().includes(term);
      }
      return (house.stores?.store ?? "").toLowerCase().includes(term);
    });

    return filtered.sort((a, b) => {
      const aVal =
        sortKey === "apartment" ? a.apartment : a.stores?.store ?? "";
      const bVal =
        sortKey === "apartment" ? b.apartment : b.stores?.store ?? "";
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [houses, searchMode, searchTerm, sortKey, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">マンション一覧</h1>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:gap-3">
          <select
            value={searchMode}
            onChange={(e) => setSearchMode(e.target.value as "apartment" | "store")}
            className="w-full md:w-48 p-2 border rounded-md"
          >
            <option value="apartment">マンション名で検索</option>
            <option value="store">店舗名で検索</option>
          </select>
          <input
            type="text"
            placeholder={searchMode === "apartment" ? "マンション名を入力..." : "店舗名を入力..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:max-w-sm p-2 border rounded-md"
          />
        </div>
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-end md:gap-3">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as "apartment" | "store")}
            className="w-full md:w-40 p-2 border rounded-md"
          >
            <option value="apartment">マンション名</option>
            <option value="store">店舗名</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="w-full md:w-32 p-2 border rounded-md"
          >
            <option value="asc">昇順</option>
            <option value="desc">降順</option>
          </select>
        </div>
      </div>
      <table className="min-w-full bg-white rounded-md shadow">
        <thead>
          <tr>
            <th className="p-2 text-left">店舗名</th>
            <th className="p-2 text-left">マンション名</th>
            <th className="p-2 text-left">住所</th>
          </tr>
        </thead>
        <tbody>
          {filteredHouses.map((house) => (
            <tr key={house.id} className="border-t">
              <td className="p-2">{house.stores?.store}</td>
              <td className="p-2">
                <Link
                  to={`/admin/panel/house/${house.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {house.apartment}
                </Link>
              </td>
              <td className="p-2">{house.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
