import { Link, useLoaderData } from "react-router";

export const loader = async () => {
  return { data: "admin index" };
};

export default function AdminIndex() {
  const { data } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">管理画面トップ {data}</h1>
      <div className="space-x-4">
        <Link to="/admin/login" className="text-indigo-600 hover:text-indigo-800">
          ログイン
        </Link>
        <Link to="/admin/panel" className="text-indigo-600 hover:text-indigo-800">
          管理パネル
        </Link>
      </div>
    </div>
  );
}
