import { Outlet, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/search";
import StoreSearch from "~/components/StoreSearcher";
import { fetchStores } from "~/lib/supabase/db";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "linough searcher" },
    { name: "description", content: "search linough adapted apartment" },
  ];
}

export const loader = async () => {
  return { storesPromise: fetchStores() };
};

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const store = formData.get("store");
  const storeId = formData.get("storeId");
  if (typeof store !== "string") return redirect("/search");

  return redirect(`/search/result?store=${encodeURIComponent(store)}&store_id=${storeId}`);
}

export default function Main() {
  const { storesPromise } = useLoaderData<typeof loader>();
  return (
    <div className="h-screen bg-gray-100 p-8">
      {/* 固定ヘッダー */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-gray-50 border-b shadow-sm px-8 py-4">
        <div className="mx-auto max-w-2xl flex flex-row items-center space-x-6 px-8">
          <h1 className="text-2xl font-bold whitespace-nowrap">店舗検索</h1>
          <div className="flex-grow">
            <StoreSearch storesPromise={storesPromise} />
          </div>
        </div>
      </div>

      {/* Outlet 表示部分 */}
      <div className="pt-12 mx-auto">
        <Outlet />
      </div>
    </div>
  );
}
