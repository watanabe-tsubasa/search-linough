// app/routes/admin.panel.house.%24houseId.tsx

import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
} from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { deleteHouse, fetchHouse, updateHouse } from "~/lib/supabase/db";
import { useMemo } from "react";
import { useQueryToast } from "~/Hooks/useQueryToast";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const houseId = Number(params.houseId);
  const house = await fetchHouse(houseId);
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  return { house, houseId, status, type };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const houseId = Number(params.houseId);
  const formData = await request.formData();
  const intent = formData.get("_action");

  if (intent === "delete") {
    try {
      await deleteHouse(houseId);
      return redirect(`/admin/panel/listHouse?type=delete&status=success`);
    } catch (error) {
      console.error(error);
      return redirect(`/admin/panel/house/${houseId}?type=delete&status=error`);
    }
  }

  const store_id = String(formData.get("store_id") || "").trim();
  const apartment = String(formData.get("apartment") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const post = String(formData.get("post") || "").trim();
  const prefectures = String(formData.get("prefectures") || "").trim();
  const householdsRaw = formData.get("households");
  const households = householdsRaw === null || householdsRaw === ""
    ? 0
    : Number(householdsRaw);

  const errors: {
    store_id?: string;
    apartment?: string;
    address?: string;
    post?: string;
    households?: string;
  } = {};

  if (!store_id) errors.store_id = "店舗コードを入力してください";
  if (!apartment) errors.apartment = "マンション名を入力してください";
  if (!address) errors.address = "住所を入力してください";
  if (post && !/^\d{3}-?\d{4}$/.test(post)) {
    errors.post = "郵便番号は7桁の数字で入力してください";
  }
  if (Number.isNaN(households) || households < 0) {
    errors.households = "世帯数は0以上の数値で入力してください";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: {
        store_id,
        apartment,
        address,
        post,
        prefectures,
        households,
      },
    };
  }

  try {
    await updateHouse(houseId, {
      store_id,
      apartment,
      address,
      post,
      prefectures,
      households,
    });
    return redirect(`/admin/panel/house/${houseId}?type=update&status=success`);
  } catch (error) {
    console.error(error);
    return redirect(`/admin/panel/house/${houseId}?type=update&status=error`);
  }
};

export default function HouseDetail() {
  const { house, houseId, status, type } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const messages = useMemo(() => ({
    status: {
      success: {
        title:
          type === "update"
            ? "マンションを更新しました"
            : type === "delete"
            ? "マンションを削除しました"
            : "処理が成功しました",
        variant: "success" as const,
      },
      error: {
        title: type === "delete" ? "削除に失敗しました" : "更新に失敗しました",
        variant: "error" as const,
      },
    },
  }), [type]);

  useQueryToast({
    query: { status, type },
    messages,
    basePath: `/admin/panel/house/${houseId}`,
  });

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow">
      <h1 className="text-2xl font-bold mb-4">マンション詳細</h1>
      {house ? (
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
                  : house.store_id
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
              マンション名
            </label>
            <input
              type="text"
              name="apartment"
              defaultValue={
                actionData?.values?.apartment !== undefined
                  ? actionData.values.apartment
                  : house.apartment
              }
              className="w-full p-2 border rounded-md"
              required
            />
            {actionData?.errors?.apartment && (
              <p className="text-sm text-red-600 mt-1">
                {actionData.errors.apartment}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              住所
            </label>
            <input
              type="text"
              name="address"
              defaultValue={
                actionData?.values?.address !== undefined
                  ? actionData.values.address
                  : house.address
              }
              className="w-full p-2 border rounded-md"
              required
            />
            {actionData?.errors?.address && (
              <p className="text-sm text-red-600 mt-1">
                {actionData.errors.address}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              郵便番号
            </label>
            <input
              type="text"
              name="post"
              defaultValue={
                actionData?.values?.post !== undefined
                  ? actionData.values.post
                  : house.post || ""
              }
              className="w-full p-2 border rounded-md"
            />
            {actionData?.errors?.post && (
              <p className="text-sm text-red-600 mt-1">
                {actionData.errors.post}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              都道府県
            </label>
            <input
              type="text"
              name="prefectures"
              defaultValue={
                actionData?.values?.prefectures !== undefined
                  ? actionData.values.prefectures
                  : house.prefectures || ""
              }
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              世帯数
            </label>
            <input
              type="number"
              name="households"
              defaultValue={
                actionData?.values?.households !== undefined
                  ? actionData.values.households
                  : house.households ?? 0
              }
              className="w-full p-2 border rounded-md"
            />
            {actionData?.errors?.households && (
              <p className="text-sm text-red-600 mt-1">
                {actionData.errors.households}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              name="_action"
              value="update"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              更新
            </button>
            <button
              type="submit"
              name="_action"
              value="delete"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              削除
            </button>
          </div>
        </Form>
      ) : (
        <p>マンションが見つかりませんでした。</p>
      )}
    </div>
  );
}
