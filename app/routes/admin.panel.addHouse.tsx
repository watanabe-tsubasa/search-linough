// app/routes/admin.panel.addHouse.tsx
/**
 * task
 * - <StoreSearchFormInput />を選択しても値が入らない理由を検証し修正
 */

import { useEffect, useMemo, useState } from "react";
import { Home, X } from "lucide-react";
import { AddFormPanel, commonAddFormLoader } from "~/components/AddFormPanel";
import type { NewHouse, Store } from "~/types";
import {
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import { fetchStores, insertHouse } from "~/lib/supabase/db";
import { FormField, StoreSearchFormInput } from "~/components/FormUI";
import { useQueryToast } from "~/Hooks/useQueryToast";

export const loader = async (args: LoaderFunctionArgs) => {
  const base = await commonAddFormLoader(args);
  const stores  = await fetchStores();
  return { ...base, stores };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const houses: NewHouse[] = [];
  let index = 0;
  while (true) {
    const store_id = formData.get(`houses[${index}][store_id]`);
    const apartment = formData.get(`houses[${index}][apartment]`);
    const address = formData.get(`houses[${index}][address]`);
    const post = formData.get(`houses[${index}][post]`);
    const prefectures = formData.get(`houses[${index}][prefectures]`);
    const households = formData.get(`houses[${index}][households]`);
    if (!store_id && !apartment) break;

    houses.push({
      store_id: String(store_id || ""),
      apartment: String(apartment || ""),
      address: String(address || ""),
      post: String(post || ""),
      prefectures: String(prefectures || ""),
      households: Number(households || 0),
    });
    index++;
  }

  try {
    await insertHouse(houses);
    return redirect("/admin/panel/addHouse?type=create&status=success");
  } catch (error) {
    console.error(error);
    return redirect("/admin/panel/addHouse?type=create&status=error");
  }
};

export type NewHouseWithStore = NewHouse & {
  store: string; // UI表示用の店舗名
};


export default function AddHouse() {

  const defaultFormData: NewHouseWithStore[] = [
    {
      store: "",
      store_id: "",
      apartment: "",
      address: "",
      post: "",
      prefectures: "",
      households: 0,
    },
  ];
  const [forms, setForms] = useState<NewHouseWithStore[]>(defaultFormData);
  const { status, type, stores } = useLoaderData<typeof loader>();

  const messages = useMemo(() => ({
    status: {
      success: {
        title: type === "create" ? "マンションを追加しました" : "処理が成功しました",
        variant: "success" as const,
      },
      error: {
        title: "エラーが発生しました",
        description: "マンションの登録に失敗しました",
        variant: "error" as const,
      },
    },
  }), [type]);

  useQueryToast({
    query: { status, type },
    messages,
    basePath: "/admin/panel/addHouse",
  });

  useEffect(() => {
    if (type === "create" && status === "success") {
      setForms(defaultFormData);
    }
  }, [status, type]);

  const handleAddForm = () => {
    setForms((prev) => [
      ...prev,
      {
        store: "",
        store_id: "",
        apartment: "",
        address: "",
        post: "",
        prefectures: "",
        households: 0,
      },
    ]);
  };

  const handleInputChange = (
    index: number,
    field: keyof NewHouseWithStore,
    value: string | number
  ) => {
    setForms((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === "households" ? Number(value) : value,
      };
      return next;
    });
  };

  const handleRemoveForm = (index: number) => {
    setForms((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <AddFormPanel
      title="マンション追加"
      onAddForm={handleAddForm}
      dialogTitle="追加するマンションの確認"
      dialogContent={<HouseConfirmDialog houses={forms} />}
      loaderData={{ status, type }}
    >
      {forms.map((form, index) => (
        <HouseForm
          key={index}
          index={index}
          form={form}
          onChange={handleInputChange}
          onRemove={handleRemoveForm}
          stores={stores}
        />
      ))}
    </AddFormPanel>
  );
}

const HouseForm = ({
  index,
  form,
  onChange,
  onRemove,
  stores,
}: {
  index: number;
  form: NewHouseWithStore;
  onChange: (index: number, field: keyof NewHouseWithStore, value: string | number) => void;
  onRemove: (index: number) => void;
  stores: Store[];
}) => {
  return (
    <div className="relative bg-white rounded-lg shadow p-6">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
        aria-label="削除"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="grid grid-cols-2 gap-4">

        <StoreSearchFormInput
          stores={stores}
          index={index}
          form={form}
          onChange={onChange}
        />


        <FormField
          label="マンション名"
          name={`houses[${index}][apartment]`}
          value={form.apartment}
          onChange={(e) => onChange(index, "apartment", e.target.value)}
          placeholder="マンション名"
          required
        />

        <FormField
          label="郵便番号"
          name={`houses[${index}][post]`}
          value={form.post}
          onChange={(e) => onChange(index, "post", e.target.value)}
          placeholder="0000000(ハイフンなし）"
          required
        />

        <FormField
          label="都道府県"
          name={`houses[${index}][prefectures]`}
          value={form.prefectures}
          onChange={(e) => onChange(index, "prefectures", e.target.value)}
          placeholder="都道府県"
          required
        />

        <FormField
          label="住所"
          name={`houses[${index}][address]`}
          value={form.address}
          onChange={(e) => onChange(index, "address", e.target.value)}
          placeholder="住所"
          className="col-span-2"
          required
        />

        <FormField
          label="世帯数"
          name={`houses[${index}][households]`}
          value={form.households}
          onChange={(e) => onChange(index, "households", e.target.value)}
          type="number"
          placeholder="0"
          required
        />

      </div>
    </div>
  );
};

const HouseConfirmDialog = ({ houses }: { houses: NewHouse[] }) => (
  <div className="space-y-4">
    {houses.map((house, i) => (
      <div key={i} className="flex items-center gap-4">
        <Home className="w-4 h-4 text-gray-400" />
        <div>
          <p className="font-medium">{house.apartment}</p>
          <p className="text-sm text-gray-500">{house.address}</p>
          <p className="text-sm text-gray-500">世帯数: {house.households}</p>
        </div>
      </div>
    ))}
  </div>
);
