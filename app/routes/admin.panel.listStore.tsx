import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { fetchStores } from "~/lib/supabase/db";
import type { Store } from "~/types";

export const loader = async (_args: LoaderFunctionArgs) => {
  const stores = await fetchStores();
  return { stores };
};

export default function ListStore() {
  const { stores } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<"store" | "store_id">("store");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredStores = [...stores]
    .filter((s: Store) =>
      s.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.store_id.includes(searchTerm)
    )
    .sort((a: Store, b: Store) => {
      const key = sortKey;
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">店舗一覧</h1>
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
          onChange={(e) => setSortKey(e.target.value as "store" | "store_id")}
          className="p-2 border rounded-md"
        >
          <option value="store">店舗名</option>
          <option value="store_id">店舗コード</option>
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
            <th className="p-2 text-left">店舗コード</th>
            <th className="p-2 text-left">店舗名</th>
          </tr>
        </thead>
        <tbody>
          {filteredStores.map((store: Store) => (
            <tr key={store.id} className="border-t">
              <td className="p-2">{store.store_id}</td>
              <td className="p-2">
                <Link
                  to={`/admin/panel/store/${store.store_id}`}
                  className="text-blue-600 hover:underline"
                >
                  {store.store}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
