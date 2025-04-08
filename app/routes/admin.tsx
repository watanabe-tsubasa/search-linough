import { Outlet, useLoaderData } from "react-router";

export const loader = async () => {
  return { data: 'admin'}
}

// 管理画面 ログインしていない場合はlogin, ログイン後panelにredirect
export default function Admin(){
  const { data } = useLoaderData<typeof loader>()
  return(
    <div>
      {data}
      <Outlet />
    </div>
  )
}