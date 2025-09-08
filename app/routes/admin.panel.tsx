// 管理画面のトップページ sidebarとoutletを配置
import { Edit, Home, LinkIcon, List, Menu, PanelLeftClose, PlusCircle, Store, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router";

const sidebarItems = [
  {
    label: '店舗一覧',
    path: '/admin/panel/listStore',
    icon: List,
    group: 'store',
  },
  {
    label: '店舗追加',
    path: '/admin/panel/addStore',
    icon: PlusCircle,
    group: 'store',
  },
  {
    label: '店舗変更・削除',
    path: '/admin/panel/editStore',
    icon: Edit,
    group: 'store',
  },
  {
    label: 'マンション追加',
    path: '/admin/panel/addHouse',
    icon: Home,
    group: 'house',
  },
  {
    label: 'マンション変更・削除',
    path: '/admin/panel/editHouse',
    icon: Edit,
    group: 'house',
  },
  {
    label: 'マンション紐付け変更',
    path: '/admin/panel/editRelation',
    icon: LinkIcon,
    group: 'house',
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 h-full flex z-40 w-60 bg-white shadow-md transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%-3.25rem)]'
          }`}>
          <div className="flex-1"
          >
            <div className="p-4 flex">
              <NavLink to="/admin/panel" className="flex flex-1 items-center space-x-2">
                <Store className="h-6 w-6" />
                <span className="text-xl font-bold">管理パネル</span>
              </NavLink>
              <div className="flex items-center justify-center bg-transparent">
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                  {sidebarOpen ? (
                    <PanelLeftClose className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
            <nav className="mt-8">
              <div className="px-4 mb-2">
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  店舗管理
                </h2>
              </div>
              {sidebarItems
                .filter((item) => item.group === 'store')
                .map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-2 text-sm ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}

              <div className="px-4 mb-2 mt-6">
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  マンション管理
                </h2>
              </div>
              {sidebarItems
                .filter((item) => item.group === 'house')
                .map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-2 text-sm ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
            </nav>

          </div>
          {/* <div className="w-10 flex items-start justify-center pt-4 bg-transparent">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? (
                <PanelLeftClose className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div> */}
        </aside>

        {/* Main content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-[17rem]' : 'ml-10'
          } p-8`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
