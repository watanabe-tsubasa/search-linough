// app/routes/admin.panel._index.tsx
import { Store } from "lucide-react";

export default function AdminIndex () {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <Store className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          管理メニューへようこそ
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          左のサイドバーから管理したい項目を選択してください。
        </p>
      </div>

      <div className="mt-10">
        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
          <div className="relative">
            <dt>
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <Store className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                店舗管理
              </p>
            </dt>
            <dd className="mt-2 ml-16 text-base text-gray-500">
              店舗の追加、編集、削除などの操作が可能です。
            </dd>
          </div>

          <div className="relative">
            <dt>
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <Store className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                マンション管理
              </p>
            </dt>
            <dd className="mt-2 ml-16 text-base text-gray-500">
              マンションの追加、編集、削除、店舗との紐付けなどの操作が可能です。
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
