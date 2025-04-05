import { Suspense, useEffect, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { Loader2, Search } from 'lucide-react';
import { Await, useSubmit } from 'react-router';
import type { Store } from '~/types';

export default function StoreSearch({
  storesPromise,
}: {
  storesPromise: Promise<Store[]>;
  initialValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const submit = useSubmit();
  const commandRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="relative" ref={commandRef}>
      <Suspense fallback={<DummyStoreSearch />}>
        <Await resolve={storesPromise}>
          {(stores) => (
            <Command className="relative border rounded-lg shadow-sm bg-white overflow-visible" loop>
              <div className="flex items-center border-b px-3">
                <Search className="w-4 h-4 text-gray-400" />
                <Command.Input
                  onFocus={() => setOpen(true)}
                  className="flex-1 outline-none border-0 p-3 text-gray-900"
                  placeholder="店舗名を入力してください..."
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
                          const formData = new FormData();
                          formData.set("store", store.store);
                          formData.set("storeId", store.store_id);
                          submit(formData, { method: "post" });
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