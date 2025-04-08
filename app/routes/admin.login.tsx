import { useLoaderData } from "react-router"

// 管理画面 へのログインsupabase authをgoogleアカウントに対して実行
export const loader = async () => {
  return { data: 'login' }
}

export default function Login(){
  const { data } = useLoaderData<typeof loader>();
  return (
    <div>
      {data}
    </div>
  )
}