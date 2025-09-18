// app/routes/admin.tsx

import { ToastProvider } from "@radix-ui/react-toast";
import { Outlet, useLoaderData } from "react-router";
import { ToastRenderer } from "~/components/ToastRender";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "linough searcher admin" },
    { name: "description", content: "edit linough relative data" },
  ];
}

export const loader = async () => {
  return { data: 'admin'}
}

// 管理画面 ログインしていない場合はlogin, ログイン後panelにredirect
export default function Admin(){
  const { data } = useLoaderData<typeof loader>()
  return(
    <div>
      <ToastProvider>
        <ToastRenderer />
        <Outlet />
      </ToastProvider>
    </div>
  )
}