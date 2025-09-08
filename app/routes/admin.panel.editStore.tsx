// 店名を変更削除する

import { Store as StoreIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/Dialog";
import { useToast } from "~/Hooks/use-toast";
import { fetchStores, updateStore, deleteStore } from "~/lib/supabase/db";
import type { Store } from "~/types";
import { useLoaderData } from "react-router";

interface StoreData extends Store {
  isChecked: boolean;
  originalStore: string;
}

export const loader = async () => {
  const stores = await fetchStores();
  return { stores };
};

export default function EditStore() {
  const { stores: loaderStores } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const { toast } = useToast();

  const [stores, setStores] = useState<StoreData[]>(
    loaderStores.map((s) => ({
      ...s,
      isChecked: false,
      originalStore: s.store,
    }))
  );

  const filteredStores = stores.filter((store) =>
    store.store.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = (id: number) => {
    setStores(
      stores.map((store) =>
        store.id === id ? { ...store, isChecked: !store.isChecked } : store
      )
    );
  };

  const handleStoreNameChange = (id: number, newName: string) => {
    setStores(
      stores.map((store) =>
        store.id === id ? { ...store, store: newName } : store
      )
    );
  };

  const handleUpdate = async () => {
    const modifiedStores = stores.filter(
      (store) => store.store !== store.originalStore
    );

    if (modifiedStores.length === 0) {
      toast({
        title: '変更がありません',
        variant: 'default',
      });
      return;
    }

    try {
      await Promise.all(
        modifiedStores.map((s) =>
          updateStore(s.store_id, { store: s.store })
        )
      );
      toast({
        title: '店舗を更新しました',
        variant: 'success',
      });
      setStores(
        stores.map((store) => ({
          ...store,
          originalStore: store.store,
        }))
      );
    } catch (error) {
      toast({
        title: 'エラーが発生しました',
        description: '店舗の更新に失敗しました',
        variant: 'error',
      });
    }
  };

  const handleDelete = async () => {
    const selectedStores = stores.filter((store) => store.isChecked);
    try {
      await Promise.all(
        selectedStores.map((s) => deleteStore(s.store_id))
      );
      setStores(stores.filter((store) => !store.isChecked));
      setIsDeleteDialogOpen(false);
      toast({
        title: '店舗を削除しました',
        variant: 'success',
      });
    } catch (error) {
      setIsDeleteDialogOpen(false);
      setIsErrorDialogOpen(true);
    }
  };

  const handleReset = () => {
    setStores(
      stores.map((store) => ({
        ...store,
        store: store.originalStore,
        isChecked: false,
      }))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">店舗変更・削除</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="店舗名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="space-y-4">
        {filteredStores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={store.isChecked}
                onChange={() => handleCheckboxChange(store.id)}
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
                    value={store.store}
                    onChange={(e) => handleStoreNameChange(store.id, e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          リセット
        </button>
        <button
          onClick={() => setIsDeleteDialogOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          削除
        </button>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          更新
        </button>
      </div>

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
                .filter((store) => store.isChecked)
                .map((store) => (
                  <div key={store.id} className="flex items-center gap-2">
                    <StoreIcon className="w-4 h-4 text-gray-400" />
                    <span>{store.store}</span>
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
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              削除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除エラー</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              選択された店舗にはマンションが紐付けられているため削除できません。
              先にマンションとの紐付けを解除してください。
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsErrorDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              閉じる
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};