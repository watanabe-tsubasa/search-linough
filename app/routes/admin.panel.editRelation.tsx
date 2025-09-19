// app/routes/admin.panel.editRelation.tsx
/**
 * tasks:
 * - []店舗コードを入力するのではなく、StoreSearcherで選択できるようにする
 * - []紐付け変更ボタン等、操作するためのUIはページ上部に配置
 * - []マンション表示のUIを./app/components/HouseCard.tsxから利用する
 */

import { Home, LinkIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Form,
  redirect,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import StoreSearch from "~/components/StoreSearcher";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/Dialog";
import { HouseCard } from "~/components/HouseCard";
import { fetchAllHouses, fetchStores, updateHousesStore } from "~/lib/supabase/db";
import type { HouseWithStore, Store } from "~/types";
import { useQueryToast } from "~/Hooks/useQueryToast";
import { useToast } from "~/Hooks/use-toast";

type HouseSelection = HouseWithStore & {
  isChecked: boolean;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const houses = await fetchAllHouses();
  const stores = await fetchStores();
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  return { houses, stores, status, type };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const store_id = String(formData.get("store_id") || "");
  const ids = formData
    .getAll("ids")
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id));

  if (!store_id || ids.length === 0) {
    return redirect("/admin/panel/editRelation?type=update&status=error");
  }

  const success = await updateHousesStore(ids, store_id);
  return redirect(
    `/admin/panel/editRelation?type=update&status=${success ? "success" : "error"}`,
  );
};

export default function EditRelation() {
  const { houses: loaderHouses, stores, status, type } = useLoaderData<typeof loader>();
  const [houses, setHouses] = useState<HouseSelection[]>(() =>
    loaderHouses.map((house) => ({ ...house, isChecked: false }))
  );
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHouses(
      loaderHouses.map((house) => ({ ...house, isChecked: false }))
    );
  }, [loaderHouses]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const messages = useMemo(() => ({
    status: {
      success: {
        title: type === "update" ? "店舗の紐付けを更新しました" : "処理が成功しました",
        variant: "success" as const,
      },
      error: {
        title: "エラーが発生しました",
        description: "店舗の紐付け更新に失敗しました",
        variant: "error" as const,
      },
    },
  }), [type]);

  useQueryToast({
    query: { status, type },
    messages,
    basePath: "/admin/panel/editRelation",
  });

  const filteredHouses = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) {
      return houses;
    }
    return houses.filter((house) =>
      house.apartment.toLowerCase().includes(term)
    );
  }, [houses, debouncedSearch]);

  const selectedHouses = useMemo(
    () => houses.filter((house) => house.isChecked),
    [houses]
  );

  const selectedCount = selectedHouses.length;

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setHouses((prev) =>
      prev.map((house) =>
        house.id === id ? { ...house, isChecked: checked } : house
      )
    );
  };

  const handleClearSelection = () => {
    setHouses((prev) => prev.map((house) => ({ ...house, isChecked: false })));
  };

  const handleOpenDialog = () => {
    if (selectedCount === 0) {
      toast({ title: "マンションが選択されていません", variant: "error" });
      return;
    }
    if (!selectedStore) {
      toast({ title: "店舗が選択されていません", variant: "error" });
      return;
    }
    setIsUpdateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">マンション紐付け変更</h1>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <span className="text-sm text-gray-500">
            選択中: <span className="font-semibold text-gray-700">{selectedCount}</span> 件
          </span>
          <button
            type="button"
            onClick={handleClearSelection}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            disabled={selectedCount === 0}
          >
            選択解除
          </button>
          <button
            type="button"
            onClick={handleOpenDialog}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={selectedCount === 0 || !selectedStore}
          >
            紐付け変更
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6 md:justify-between">
        <div className="w-full md:max-w-md space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex">
            変更先店舗
            {selectedStore ? (
              <p className="text-sm text-gray-500">
                ： {selectedStore.store}（{selectedStore.store_id}）
              </p>
            ) : (
              <p className="text-sm text-gray-400">：店舗を選択してください</p>
            )}
          </label>
          <StoreSearch
            stores={stores}
            onSelect={(store) => setSelectedStore(store)}
            value={selectedStore?.store ?? ""}
            placeholder="店舗名を検索..."
          />
          <button
            type="button"
            onClick={() => setSelectedStore(null)}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            disabled={!selectedStore}
          >
            店舗選択をクリア
          </button>
        </div>

        <div className="w-full md:max-w-md self-start flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-700">
            マンション名で検索
          </label>
          <input
            type="text"
            placeholder="マンション名..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full p-2 py-3 border rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredHouses.map((house) => (
          <HouseCard
            key={house.id}
            house={house}
            selectable
            selected={house.isChecked}
            onSelectChange={(checked) => handleCheckboxChange(house.id, checked)}
            showStore={false}
          >
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <LinkIcon className="w-4 h-4" />
              <span>現在の店舗: {house.stores?.store}（{house.store_id}）</span>
            </div>
          </HouseCard>
        ))}
      </div>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>店舗紐付けの変更確認</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              選択したマンションの店舗コードを
              <span className="font-medium">
                {selectedStore?.store}（{selectedStore?.store_id}）
              </span>
              に変更します。
            </p>
            <div className="mt-4 space-y-2">
              {selectedHouses.map((house) => (
                <div key={house.id} className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span>{house.apartment}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsUpdateDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
            <Form method="post">
              <input type="hidden" name="store_id" value={selectedStore?.store_id ?? ""} />
              {selectedHouses.map((house) => (
                <input
                  key={house.id}
                  type="hidden"
                  name="ids"
                  value={house.id}
                />
              ))}
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                変更
              </button>
            </Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
