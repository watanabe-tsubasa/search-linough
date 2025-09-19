// app/routes/admin.panel.addStore.tsx
/**
 * tasks:
 * [x] 追加ボタン等、操作するためのUIはページ上部に配置
 */

import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { AddFormPanel, commonAddFormLoader } from "~/components/AddFormPanel";
import type { NewStore } from "~/types";
import { redirect, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { insertStore } from "~/lib/supabase/db";
import { FormField } from "~/components/FormUI";
import { useQueryToast } from "~/Hooks/useQueryToast";

export const loader = async (args: LoaderFunctionArgs) => {
  return await commonAddFormLoader(args);
};

// ✅ action関数：フォーム送信処理
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const stores: NewStore[] = [];

  let index = 0;
  while (true) {
    const store_id = formData.get(`stores[${index}][store_id]`);
    const store = formData.get(`stores[${index}][store]`);
    if (!store_id && !store) break;

    stores.push({
      store_id: String(store_id || ""),
      store: String(store || ""),
    });
    index++;
  }

  try {
    await insertStore(stores);
    return redirect("/admin/panel/addStore?type=create&status=success");
  } catch (error) {
    console.error(error);
    return redirect("/admin/panel/addStore?type=create&status=error");
  }
};


// ✅ ページ本体
export default function AddStore() {
  const defaultFormData: NewStore[] = [
    { store: "", store_id: "" },
  ]
  const [forms, setForms] = useState<NewStore[]>(defaultFormData);
  
  const { status, type } = useLoaderData<typeof loader>();

  const messages = useMemo(() => ({
    status: {
      success: {
        title: type === "create" ? "店舗を追加しました" : "処理が成功しました",
        variant: "success" as const,
      },
      error: {
        title: "エラーが発生しました",
        description: "店舗の登録に失敗しました",
        variant: "error" as const,
      },
    },
  }), [type]);

  useQueryToast({
    query: { status, type },
    messages,
    basePath: "/admin/panel/addStore",
  });

  useEffect(() => {
    if (type === "create" && status === "success") {
      setForms(defaultFormData);
    }
  }, [status, type]);
  
  const handleAddForm = () => {
    setForms([...forms, { store: "", store_id: "" }]);
  };

  const handleInputChange = (
    index: number,
    field: keyof NewStore,
    value: string
  ) => {
    const newForms = [...forms];
    (newForms[index][field] as string) = value;
    setForms(newForms);
  };

  const handleRemoveForm = (index: number) => {
    if (forms.length === 1) return;
    setForms(forms.filter((_, i) => i !== index));
  };

  return (
      <AddFormPanel
        title="店舗追加"
        onAddForm={handleAddForm}
        dialogTitle="追加する店舗の確認"
        dialogContent={<ConfirmDialog stores={forms} />}
        loaderData={{ status, type }}
      >
        {forms.map((form, index) => (
          <StoreForm
            key={index}
            index={index}
            form={form}
            onChange={handleInputChange}
            onRemove={handleRemoveForm}
          />
        ))}
      </AddFormPanel>
  );
}

// ✅ フォームUI（indexからname属性を生成）
const StoreForm = ({
  index,
  form,
  onChange,
  onRemove,
}: {
  index: number;
  form: NewStore;
  onChange: (index: number, field: keyof NewStore, value: string) => void;
  onRemove: (index: number) => void;
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
        <FormField
          label="店舗コード"
          name={`stores[${index}][store_id]`}
          value={form.store_id}
          onChange={(e) => onChange(index, "store_id", e.target.value)}
          placeholder="14桁のコード"
          required
          maxLength={14}
        />

        <FormField
          label="店舗名"
          name={`stores[${index}][store]`}
          value={form.store}
          onChange={(e) => onChange(index, "store", e.target.value)}
          placeholder="店舗名"
          required
        />

      </div>
    </div>
  );
};

// ✅ 確認ダイアログ
const ConfirmDialog = ({ stores }: { stores: NewStore[] }) => {
  return (
    <div className="space-y-4">
      {stores.map((store, index) => (
        <div key={index} className="flex items-center gap-4">
          <ShoppingBag className="w-4 h-4 text-gray-400" />
          <div>
            <p className="font-medium">{store.store}</p>
            <p className="text-sm text-gray-500">{store.store_id}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
