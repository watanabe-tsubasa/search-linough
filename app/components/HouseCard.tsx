import type { ReactNode } from "react";
import type { HouseWithStore } from "~/types";

type HouseCardProps = {
  house: HouseWithStore;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  action?: ReactNode;
  showStore?: boolean;
  children?: ReactNode;
};

export function HouseCard({
  house,
  selectable = false,
  selected = false,
  onSelectChange,
  action,
  showStore = true,
  children,
}: HouseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start gap-4">
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelectChange?.(event.currentTarget.checked)}
            className="mt-1"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">{house.apartment}</h3>
            {action}
          </div>
          <p className="text-gray-600">{house.address}</p>
          <p className="text-gray-500 text-sm">
            〒{house.post} {house.prefectures}
          </p>
          <p className="text-gray-500 text-sm">世帯数: {house.households}</p>
          {showStore && house.stores?.store && (
            <p className="text-gray-500 text-sm">
              担当店舗: {house.stores.store}（{house.store_id}）
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function HouseCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-4" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/3 bg-gray-200 rounded" />
    </div>
  );
}
