// app/routes/admin.panel.editHouse.tsx
/**
 * tasks:
 * [x] 削除ボタン等、操作するためのUIはページ上部に配置
 * [x] マンション表示用のUIをcomponent化(./app/components/HouseCard.tsx)
 */

import { Home } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/Dialog";
import { useQueryToast } from "~/Hooks/useQueryToast";
import {
  deleteMultipleHouses,
  fetchAllHouses,
  updateHouse,
} from "~/lib/supabase/db";
import {
  redirect,
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { HouseCard } from "~/components/HouseCard";
import type { House, HouseWithStore } from "~/types";

// ========== Loader ==========
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");

  const houses = await fetchAllHouses();

  return { houses, type, status };
};

// ========== Action ==========
export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    if (intent === "update") {
      const payload = JSON.parse(
        String(form.get("payload") ?? "{}")
      ) as Partial<House> & { id?: number };

      if (!payload.id) {
        throw new Error("Invalid payload");
      }

      const households = Number(payload.households ?? 0);

      if (Number.isNaN(households)) {
        throw new Error("Invalid households value");
      }

      await updateHouse(payload.id, {
        apartment: payload.apartment,
        address: payload.address,
        post: payload.post,
        prefectures: payload.prefectures,
        households,
      });

      return redirect(
        "/admin/panel/editHouse?type=update&status=success"
      );
    }

    if (intent === "delete") {
      const ids = JSON.parse(
        String(form.get("ids") ?? "[]")
      ) as Array<number>;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("No ids provided");
      }

      await deleteMultipleHouses(ids);

      return redirect(
        "/admin/panel/editHouse?type=delete&status=success"
      );
    }
  } catch (error) {
    console.error("Failed to process editHouse action", error);
    return redirect("/admin/panel/editHouse?status=error");
  }

  return new Response("Bad Request", { status: 400 });
}

// ========== Component ==========
export default function EditHouse() {
  const { houses, type, status } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<HouseWithStore | null>(
    null
  );

  const filteredHouses = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return houses.filter((house) =>
      house.apartment.toLowerCase().includes(term)
    );
  }, [houses, searchTerm]);

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return [...prev, id];
      }
      return prev.filter((value) => value !== id);
    });
  };

  const handleEdit = (house: HouseWithStore) => {
    setSelectedHouse(house);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedHouse) return;

    fetcher.submit(
      {
        intent: "update",
        payload: JSON.stringify({
          id: selectedHouse.id,
          apartment: selectedHouse.apartment,
          address: selectedHouse.address,
          post: selectedHouse.post,
          prefectures: selectedHouse.prefectures,
          households: selectedHouse.households,
        }),
      },
      { method: "post" }
    );

    setIsEditDialogOpen(false);
    setSelectedHouse(null);
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;

    fetcher.submit(
      { intent: "delete", ids: JSON.stringify(selectedIds) },
      { method: "post" }
    );

    setIsDeleteDialogOpen(false);
    setSelectedIds([]);
  };

  const isProcessing = fetcher.state !== "idle";
  const housesForDelete = houses.filter((house) =>
    selectedIds.includes(house.id)
  );

  const messages = useMemo(
    () => ({
      status: {
        success: {
          title: "処理が成功しました",
        },
      },
      type: {
        update: {
          title: "マンションを更新しました",
        },
        delete: {
          title: "マンションを削除しました",
        },
      },
    }),
    []
  );

  useQueryToast({
    query: { status, type },
    messages,
    basePath: "/admin/panel/editHouse",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">マンション変更・削除</h1>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={selectedIds.length === 0 || isProcessing}
          >
            一括削除
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="マンション名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-sm p-2 border rounded-md"
        />
        <p className="text-sm text-gray-500 md:text-right">
          選択中: <span className="font-semibold text-gray-700">{selectedIds.length}</span> 件
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredHouses.map((house) => (
          <HouseCard
            key={house.id}
            house={house}
            selectable
            selected={selectedIds.includes(house.id)}
            onSelectChange={(checked) => handleCheckboxChange(house.id, checked)}
            action={
              <button
                onClick={() => handleEdit(house)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                編集
              </button>
            }
          />
        ))}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>マンションの削除確認</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              選択したマンションを削除します。この操作は取り消せません。
            </p>
            <div className="mt-4 space-y-2">
              {housesForDelete.map((house) => (
                <div key={house.id} className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span>{house.apartment}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={isProcessing}
            >
              削除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedHouse(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>マンション情報の編集</DialogTitle>
          </DialogHeader>
          {selectedHouse && (
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    マンション名
                  </label>
                  <input
                    type="text"
                    value={selectedHouse.apartment}
                    onChange={(e) =>
                      setSelectedHouse((prev) =>
                        prev
                          ? { ...prev, apartment: e.target.value }
                          : prev
                      )
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    住所
                  </label>
                  <input
                    type="text"
                    value={selectedHouse.address}
                    onChange={(e) =>
                      setSelectedHouse((prev) =>
                        prev
                          ? { ...prev, address: e.target.value }
                          : prev
                      )
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      郵便番号
                    </label>
                    <input
                      type="text"
                      value={selectedHouse.post}
                      onChange={(e) =>
                        setSelectedHouse((prev) =>
                          prev
                            ? { ...prev, post: e.target.value }
                            : prev
                        )
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      都道府県
                    </label>
                    <input
                      type="text"
                      value={selectedHouse.prefectures}
                      onChange={(e) =>
                        setSelectedHouse((prev) =>
                          prev
                            ? { ...prev, prefectures: e.target.value }
                            : prev
                        )
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    世帯数
                  </label>
                  <input
                    type="number"
                    value={selectedHouse.households}
                    onChange={(e) =>
                      setSelectedHouse((prev) =>
                        prev
                          ? {
                              ...prev,
                              households: Number(e.target.value) || 0,
                            }
                          : prev
                      )
                    }
                    className="w-full p-2 border rounded-md"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setIsEditDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isProcessing}
            >
              更新
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
