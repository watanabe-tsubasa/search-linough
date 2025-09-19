import { Suspense, useEffect, useRef, useState } from "react";
import { Command } from "cmdk";
import { Loader2, Search } from "lucide-react";
import { Await, useSubmit } from "react-router";
import type { Store } from "~/types";

type StoreSearcherProps = {
  stores: Promise<Store[]> | Store[];
  onSelect?: (store: Store) => void;
  value?: string;
  placeholder?: string;
};

export default function StoreSearch({
  stores,
  onSelect,
  value,
  placeholder = "店舗名を入力してください...",
}: StoreSearcherProps) {
  const [open, setOpen] = useState(false);
  const submit = useSubmit();
  const commandRef = useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = useState(value ?? "");

  // 外側クリックを監視する
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (value === undefined) return;
    setInputValue(value);
  }, [value]);

  return (
    <div className="relative" ref={commandRef}>
      <Suspense fallback={<DummyStoreSearch />}>
        <Await resolve={stores}>
          {(stores) =>  (
            <Command className="relative border rounded-lg shadow-sm bg-white overflow-visible" loop>
              <div className="flex items-center border-b px-3">
                <Search className="w-4 h-4 text-gray-400" />
                <Command.Input
                  onFocus={() => setOpen(true)}
                  value={inputValue}
                  onValueChange={setInputValue}
                  className="flex-1 outline-none border-0 p-3 text-gray-900"
                  placeholder={placeholder}
                />
              </div>

              {open && (
                <Command.List className="absolute top-full left-0 w-full max-h-[300px] bg-white border border-t-0 rounded-b-lg shadow-lg overflow-y-auto z-10 p-2">
                  {stores
                    // .filter((store) => store.toLowerCase().includes(value.toLowerCase()))
                    .map((store) => (
                      <Command.Item
                        key={store.store_id}
                        value={store.store}
                        onSelect={() => {
                          setInputValue(store.store);
                          if (onSelect) {
                            onSelect(store);
                          } else {
                            const formData = new FormData();
                            formData.set("store", store.store);
                            formData.set("storeId", store.store_id);
                            submit(formData, { method: "post" });
                          }
                          setOpen(false);
                        }}
                        className="px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer"
                      >
                        {store.store}
                      </Command.Item>
                    ))}
                </Command.List>
              )}
            </Command>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
const DummyStoreSearch = () => {
  return (
    <div className="relative">
      <Command className="border rounded-lg shadow-sm bg-gray-50 overflow-hidden animate-pulse" loop>
        <div className="flex items-center border-b px-3">
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          <Command.Loading className="flex-1 outline-none border-0 p-3 text-gray-500">
            店舗名を入力してください...
          </Command.Loading>
        </div>
      </Command>
    </div>
  );
}

// export default function StoreSearch({ storesPromise }: { storesPromise: Promise<{ stores: Store[]; error: any }> }) {
//   console.log("StoreSearch received:", storesPromise);

//   return (
//     <div className="relative">
//       <Suspense fallback={<div>Loading...</div>}>
//         <Await resolve={storesPromise}>
//           {(result) => {
//             console.log("Await resolved with:", result);
//             const { stores } = result;
//             return (
//               <ul>
//                 {stores.map((s) => (
//                   <li key={s.store_id}>{s.store}</li>
//                 ))}
//               </ul>
//             );
//           }}
//         </Await>
//       </Suspense>
//     </div>
//   );
// }
