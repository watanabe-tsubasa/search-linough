// app/routes/admin.panel.editStore.tsx
/**
 * tasks:
 * [x] 削除ボタン等、操作するためのUIはページ上部に配置
 */

import { Store as StoreIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/Dialog";
import {
  fetchStores,
  updateStore,
  deleteStore
} from "~/lib/supabase/db";
import {
  redirect,
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { useQueryToast } from "~/Hooks/useQueryToast";

// ========== Loader ==========
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");

  const stores = await fetchStores();
  return { stores, type, status };
};

// ========== Action ==========
export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    if (intent === "update") {
      const items = JSON.parse(
        String(form.get("payload") ?? "[]")
      ) as Array<{ store_id: string | number; store: string }>;

      await Promise.all(
        items.map((s) =>
          updateStore(String(s.store_id), { store: s.store })
        )
      );
      return redirect(
        "/admin/panel/editStore?type=update&status=success"
      );
    }

    if (intent === "delete") {
      const ids = JSON.parse(
        String(form.get("ids") ?? "[]")
      ) as Array<string | number>;

      await Promise.all(ids.map((id) => deleteStore(String(id))));
      return redirect(
        "/admin/panel/editStore?type=delete&status=success"
      );
    }
  } catch (error) {
    return redirect("/admin/panel/editStore?status=error");
  }

  return new Response("Bad Request", { status: 400 });
}

// ========== Component ==========
export default function EditStore() {
  const { stores, type, status } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isProcessing = fetcher.state !== "idle";

  // フィルタリング
  const filteredStores = stores.filter((store) =>
    store.store.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 店舗名の更新（blur で即送信）
  const handleUpdate = (store_id: string, newName: string) => {
    fetcher.submit(
      {
        intent: "update",
        payload: JSON.stringify([{ store_id, store: newName }]),
      },
      { method: "post" }
    );
  };

  // 削除実行
  const handleDelete = (ids: string[]) => {
    fetcher.submit(
      { intent: "delete", ids: JSON.stringify(ids) },
      { method: "post" }
    );
    setIsDeleteDialogOpen(false);
  };

  // Toast 表示とクエリ削除
  const messages = useMemo(() => ({
    status: { success: { title: "処理が成功しました" } },
    type: {
      update: { title: "店舗を更新しました" },
      delete: { title: "店舗を削除しました" },
    },
  }), []);

  useQueryToast({
    query: { status, type },
    messages: messages,
    basePath: "/admin/panel/editStore",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">店舗変更・削除</h1>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <span className="text-sm text-gray-500">
            選択中: <span className="font-semibold text-gray-700">{selectedIds.length}</span> 件
          </span>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={selectedIds.length === 0 || isProcessing}
          >
            削除
          </button>
        </div>
      </div>

      {/* 検索 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="店舗名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-sm p-2 border rounded-md"
        />
      </div>

      {/* 店舗一覧 */}
      <div className="space-y-4">
        {filteredStores.map((store) => (
          <div
            key={store.store_id}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-start gap-4">
              {/* 削除用チェックボックス */}
              <input
                type="checkbox"
                value={store.store_id}
                checked={selectedIds.includes(store.store_id)}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  if (checked) {
                    setSelectedIds((prev) => [
                      ...prev,
                      store.store_id,
                    ]);
                  } else {
                    setSelectedIds((prev) =>
                      prev.filter((id) => id !== store.store_id)
                    );
                  }
                }}
                className="mt-1"
              />
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    店舗コード
                  </label>
                  <input
                    type="text"
                    value={store.store_id}
                    disabled
                    className="w-full p-2 border rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    店舗名
                  </label>
                  <input
                    type="text"
                    defaultValue={store.store}
                    onBlur={(e) =>
                      handleUpdate(store.store_id, e.currentTarget.value)
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 削除ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>店舗の削除確認</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              選択した店舗を削除します。この操作は取り消せません。
            </p>
            <div className="mt-4 space-y-2">
              {stores
                .filter((s) => selectedIds.includes(s.store_id))
                .map((s) => (
                  <div
                    key={s.store_id}
                    className="flex items-center gap-2"
                  >
                    <StoreIcon className="w-4 h-4 text-gray-400" />
                    <span>{s.store}</span>
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
              onClick={() => handleDelete(selectedIds)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              disabled={isProcessing}
            >
              削除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
