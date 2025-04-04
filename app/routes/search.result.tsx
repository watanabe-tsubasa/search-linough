import { Loader2 } from "lucide-react";
import { Suspense, useState } from "react";
import { Await, useLoaderData, useNavigation, type LoaderFunctionArgs } from "react-router";
import { ApartmentCards, FakeApartmentCards, fetchApartments } from "~/components/ApartmentSearcher";
import { type HouseData } from "~/types";

export const loader = async({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const store = url.searchParams.get("store");
  return { store, apartmentsPromise: fetchApartments(store) }
}

export default function StoreDetails() {
  const navigation = useNavigation();
  const { formData, state } = navigation
  const transitionStore = formData?.get("store")
    
  const [addressSearchTerm, setAddressSearchTerm] = useState("");
  const data = useLoaderData<typeof loader>();
  const { store, apartmentsPromise } = data;
  return (
    <div className="bg-gray-100 px-8 pt-8">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className={`
            text-3xl font-bold mb-2
            ${state !== "idle" ? "text-gray-400": "text-gray-900"}
          `}>
            <div className="flex flex-row items-center gap-x-2">
              {transitionStore ? String(transitionStore) : store}
              {state === 'idle' || <Loader2 className="animate-spin" />}
            </div>
          </h1>
          {/* <p className="text-gray-600">
            該当物件数: {filteredApartments.length}件
          </p> */}
        </div>

        <div className="mb-6">
          <label htmlFor="addressSearch" className="block text-sm font-medium text-gray-700 mb-1">
            住所で検索
          </label>
          <input
            id="addressSearch"
            type="text"
            placeholder="住所を入力..."
            value={addressSearchTerm}
            onChange={(e) => setAddressSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>
        <div
          className="overflow-y-auto"
          style={{ height: "calc(100vh - 300px)" }} // 例: ヘッダー + 検索 + margin 合計
        >
          <Suspense fallback={<FakeApartmentCards />}>
            <Await resolve={apartmentsPromise}>
              {(apartments: HouseData[]) => (
                <ApartmentCards apartments={apartments} addressSearchTerm={addressSearchTerm} />
              )}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
