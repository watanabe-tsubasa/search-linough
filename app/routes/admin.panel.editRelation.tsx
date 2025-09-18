// app/routes/admin.panel.editRelation.tsx

import { Home, LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Form,
  redirect,
  useLoaderData,
  useLocation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/Dialog";
import { useToast } from "~/Hooks/use-toast";
import { fetchAllHouses, updateHousesStore } from "~/lib/supabase/db";
import type { HouseWithStore } from "~/types";

type HouseSelection = HouseWithStore & {
  isChecked: boolean;
};

export const loader = async (_args: LoaderFunctionArgs) => {
  const houses = await fetchAllHouses();
  return { houses };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const store_id = String(formData.get("store_id") || "");
  const ids = formData
    .getAll("ids")
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id));

  if (!store_id || ids.length === 0) {
    return redirect("/admin/panel/editRelation?success=0");
  }

  const success = await updateHousesStore(ids, store_id);
  return redirect(`/admin/panel/editRelation?success=${success ? 1 : 0}`);
};

export default function EditRelation() {
  const { houses: loaderHouses } = useLoaderData<typeof loader>();
  const [houses, setHouses] = useState<HouseSelection[]>(() =>
    loaderHouses.map((house) => ({ ...house, isChecked: false }))
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [newStoreId, setNewStoreId] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    setHouses(
      loaderHouses.map((house) => ({ ...house, isChecked: false }))
    );
  }, [loaderHouses]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get("success");
    if (success === "1") {
      toast({ title: "店舗の紐付けを更新しました", variant: "success" });
    } else if (success === "0") {
      toast({
        title: "エラーが発生しました",
        description: "店舗の紐付け更新に失敗しました",
        variant: "error",
      });
    }
  }, [location.search, toast]);

  const filteredHouses = houses.filter((house) =>
    house.apartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = (id: number) => {
    setHouses(
      houses.map((house) =>
        house.id === id ? { ...house, isChecked: !house.isChecked } : house
      )
    );
  };

  const handleOpenDialog = () => {
    const selected = houses.filter((h) => h.isChecked);
    if (selected.length === 0) {
      toast({ title: "マンションが選択されていません", variant: "error" });
      return;
    }
    if (!newStoreId) {
      toast({ title: "店舗コードが入力されていません", variant: "error" });
      return;
    }
    setIsUpdateDialogOpen(true);
  };

  const selectedHouses = houses.filter((h) => h.isChecked);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">マンション紐付け変更</h1>

      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            変更先店舗コード
          </label>
          <input
            type="text"
            value={newStoreId}
            onChange={(e) => setNewStoreId(e.target.value)}
            placeholder="14桁のコード"
            className="w-full p-2 border rounded-md"
            maxLength={14}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            マンション名で検索
          </label>
          <input
            type="text"
            placeholder="マンション名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHouses.map((house) => (
          <div key={house.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={house.isChecked}
                onChange={() => handleCheckboxChange(house.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2">{house.apartment}</h3>
                <p className="text-gray-600">{house.address}</p>
                <p className="text-gray-500 text-sm">
                  〒{house.post} {house.prefectures}
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <LinkIcon className="w-4 h-4" />
                  <span>現在の店舗コード: {house.store_id}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleOpenDialog}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          紐付け変更
        </button>
      </div>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>店舗紐付けの変更確認</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              選択したマンションの店舗コードを
              <span className="font-medium">{newStoreId}</span>
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
              <input type="hidden" name="store_id" value={newStoreId} />
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

