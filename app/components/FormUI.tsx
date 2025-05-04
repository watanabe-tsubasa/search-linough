// components/FormField.tsx
import { Suspense, useEffect, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { Loader2, Search } from 'lucide-react';
import { Await } from 'react-router';
import type { NewHouse, Store } from '~/types';
import type { NewHouseWithStore } from '~/routes/admin.panel.addHouse';

type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  maxLength?: number;
};

export const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  required = false,
  maxLength,
}: FormFieldProps) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full p-2 border rounded-md"
      />
    </div>
  );
};

export const StoreSearchFormInput = ({
  stores,
  index,
  form,
  onChange,
}: {
  stores: Promise<Store[]> | Store[];
  index: number;
  form: NewHouseWithStore; 
  onChange: (index: number, field: "store" | "store_id", value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const commandRef = useRef<HTMLDivElement | null>(null);

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
      {/* hidden inputs を form の一部に */}
      <input
        type="hidden"
        name={`houses[${index}][store]`}
        value={form.store}
      />
      <input
        type="hidden"
        name={`houses[${index}][store_id]`}
        value={form.store_id}
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">店舗名</label>

      <Suspense fallback={<DummyStoreSearch />}>
        <Await resolve={stores}>
          {(stores) => (
            <Command className="relative border rounded-lg shadow-sm bg-white overflow-visible" loop>
              <div className="flex items-center border-b px-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Command.Input
                  onFocus={() => setOpen(true)}
                  value={form.store}
                  onValueChange={(value) => onChange(index, "store", value)}
                  className="flex-1 outline-none border-0 p-2 text-gray-900"
                  placeholder="店舗名を入力してください..."
                />
              </div>

              {open && (
                <Command.List className="absolute top-full left-0 w-full max-h-[300px] bg-white border border-t-0 rounded-b-lg shadow-lg overflow-y-auto z-10 p-2">
                  {stores.map((store) => (
                    <Command.Item
                      key={store.store_id}
                      value={store.store}
                      onSelect={() => {
                        onChange(index, "store", store.store);
                        onChange(index, "store_id", store.store_id);
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
};

const DummyStoreSearch = () => {
  return (
    <div className="relative">
      <Command className="border rounded-lg shadow-sm bg-gray-50 overflow-hidden animate-pulse" loop>
        <div className="flex items-center border-b px-2">
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          <Command.Loading className="flex-1 outline-none border-0 p-2 text-gray-500 truncate">
            店舗名を入力してください...
          </Command.Loading>
        </div>
      </Command>
    </div>
  );
}
