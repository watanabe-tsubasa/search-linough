// 管理画面のトップページ sidebarとoutletを配置

import { Outlet } from "react-router";

export default function Panel() {
  return (
    <div>
      <div>panel</div>
      <Outlet />
    </div>

  )
}