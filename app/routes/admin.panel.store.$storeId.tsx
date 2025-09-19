// app/routes/admin.panel.house.%24houseId.tsx

import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
} from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { fetchStoreById, updateStore } from "~/lib/supabase/db";
import { useMemo } from "react";
import { useQueryToast } from "~/Hooks/useQueryToast";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const storeId = params.storeId as string;
  const store = await fetchStoreById(storeId);
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  return { store, storeId, status, type };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const store = String(formData.get("store") || "").trim();
  const store_id = String(formData.get("store_id") || "").trim();
  const originalId = params.storeId as string;

  const errors: { store?: string; store_id?: string } = {};
  if (!store_id) {
    errors.store_id = "店舗コードを入力してください";
  }
  if (!store) {
    errors.store = "店舗名を入力してください";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values: { store, store_id } };
  }

  try {
    await updateStore(originalId, { store, store_id });
    return redirect(`/admin/panel/store/${store_id}?type=update&status=success`);
  } catch (error) {
    console.error(error);
    return redirect(`/admin/panel/store/${originalId}?type=update&status=error`);
  }
};

export default function StoreDetail() {
  const { store, storeId, status, type } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const messages = useMemo(() => ({
    status: {
      success: {
        title: type === "update" ? "店舗を更新しました" : "処理が成功しました",
        variant: "success" as const,
      },
      error: {
        title: "更新に失敗しました",
        variant: "error" as const,
      },
    },
  }), [type]);

  useQueryToast({
    query: { status, type },
    messages,
    basePath: `/admin/panel/store/${storeId}`,
  });

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow">
      <h1 className="text-2xl font-bold mb-4">店舗詳細</h1>
      {store ? (
        <Form method="post" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              店舗コード
            </label>
            <input
              type="text"
              name="store_id"
              defaultValue={
                actionData?.values?.store_id !== undefined
                  ? actionData.values.store_id
                  : store.store_id
              }
              className="w-full p-2 border rounded-md"
              required
            />
            {actionData?.errors?.store_id && (
              <p className="text-sm text-red-600 mt-1">
                {actionData.errors.store_id}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              店舗名
            </label>
            <input
              type="text"
              name="store"
              defaultValue={
                actionData?.values?.store !== undefined
                  ? actionData.values.store
                  : store.store
              }
              className="w-full p-2 border rounded-md"
              required
            />
            {actionData?.errors?.store && (
              <p className="text-sm text-red-600 mt-1">
                {actionData.errors.store}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            更新
          </button>
        </Form>
      ) : (
        <p>店舗が見つかりませんでした。</p>
      )}
    </div>
  );
}
