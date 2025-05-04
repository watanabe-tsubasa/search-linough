// マンションを削除・変更する

import { Home } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/Dialog";
import { useToast } from "~/Hooks/use-toast";
import type { House } from "~/types";
import { mockApiCall } from "~/utils";

interface HouseData extends House {
  isChecked: boolean;
}

export default function EditHouse() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<HouseData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock data
  const [houses, setHouses] = useState<HouseData[]>([
    {
      id: 1,
      store_id: '0105123456789',
      apartment: 'サンプルマンション',
      address: '東京都新宿区1-1-1',
      post: '160-0022',
      prefectures: '東京都',
      households: 100,
      isChecked: false,
    },
  ]);

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

  const handleEdit = (house: HouseData) => {
    setSelectedHouse(house);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedHouse) return;

    try {
      await mockApiCall(selectedHouse);
      setHouses(
        houses.map((house) =>
          house.id === selectedHouse.id ? selectedHouse : house
        )
      );
      toast({
        title: 'マンションを更新しました',
        variant: 'success',
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: 'エラーが発生しました',
        description: 'マンションの更新に失敗しました',
        variant: 'error',
      });
    }
  };

  const handleDelete = async () => {
    const selectedHouses = houses.filter((house) => house.isChecked);
    try {
      await mockApiCall(selectedHouses);
      setHouses(houses.filter((house) => !house.isChecked));
      setIsDeleteDialogOpen(false);
      toast({
        title: 'マンションを削除しました',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'エラーが発生しました',
        description: 'マンションの削除に失敗しました',
        variant: 'error',
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">マンション変更・削除</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="マンション名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
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
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">{house.apartment}</h3>
                  <button
                    onClick={() => handleEdit(house)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    編集
                  </button>
                </div>
                <p className="text-gray-600">{house.address}</p>
                <p className="text-gray-500 text-sm">
                  〒{house.post} {house.prefectures}
                </p>
                <p className="text-gray-500 text-sm">世帯数: {house.households}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setIsDeleteDialogOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          一括削除
        </button>
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
              {houses
                .filter((house) => house.isChecked)
                .map((house) => (
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
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              削除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                      setSelectedHouse({
                        ...selectedHouse,
                        apartment: e.target.value,
                      })
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
                      setSelectedHouse({
                        ...selectedHouse,
                        address: e.target.value,
                      })
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
                        setSelectedHouse({
                          ...selectedHouse,
                          post: e.target.value,
                        })
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
                        setSelectedHouse({
                          ...selectedHouse,
                          prefectures: e.target.value,
                        })
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
                      setSelectedHouse({
                        ...selectedHouse,
                        households: Number(e.target.value),
                      })
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              更新
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
