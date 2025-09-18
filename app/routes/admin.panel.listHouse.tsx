// app/routes/admin.panel.listHouse.tsx

import { useEffect, useState } from "react";
import { Link, useLoaderData, useLocation } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { fetchAllHouses } from "~/lib/supabase/db";
import { useToast } from "~/Hooks/use-toast";
import type { HouseWithStore } from "~/types";

export const loader = async (_args: LoaderFunctionArgs) => {
  const houses = await fetchAllHouses();
  return { houses };
};

export default function ListHouse() {
  const { houses } = useLoaderData<typeof loader>();
  const location = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<"apartment" | "store">("apartment");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const deleted = params.get("deleted");
    if (deleted === "1") {
      toast({ title: "マンションを削除しました", variant: "success" });
    } else if (deleted === "0") {
      toast({ title: "削除に失敗しました", variant: "error" });
    }
  }, [location.search, toast]);

  const filteredHouses: HouseWithStore[] = [...houses]
    .filter((h) =>
      h.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.stores?.store ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal =
        sortKey === "apartment" ? a.apartment : a.stores?.store ?? "";
      const bVal =
        sortKey === "apartment" ? b.apartment : b.stores?.store ?? "";
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">マンション一覧</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-md flex-grow"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as "apartment" | "store")}
          className="p-2 border rounded-md"
        >
          <option value="apartment">マンション名</option>
          <option value="store">店舗名</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="p-2 border rounded-md"
        >
          <option value="asc">昇順</option>
          <option value="desc">降順</option>
        </select>
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
