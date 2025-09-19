import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loader, default as AdminPanel } from "../../app/routes/admin.panel";

const requireSessionMock = vi.hoisted(() => vi.fn());
const navLinkCalls = vi.hoisted(() => [] as Array<{ to: string; label: string }>)

vi.mock("~/lib/session.server", () => ({
  requireUserSession: requireSessionMock,
}));

vi.mock("virtual:react-router/with-props", () => ({
  __esModule: true,
  withComponentProps: <T,>(component: T) => component,
  withErrorBoundary: <T,>(component: T) => component,
  withProps: <T,>(component: T) => component,
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    NavLink: ({ to, children }: { to: string; children: ReactNode }) => {
      navLinkCalls.push({ to, label: typeof children === "string" ? children : "" });
      return <a data-navlink="true" href={to}>{children}</a>;
    },
    Outlet: () => <div data-testid="panel-outlet" />,
  };
});

beforeEach(() => {
  requireSessionMock.mockReset();
  navLinkCalls.length = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin.panel loader", () => {
  it("requires an authenticated session", async () => {
    const request = new Request("https://example.com/admin/panel");

    await loader({ request } as never);

    expect(requireSessionMock).toHaveBeenCalledWith(request);
  });
});

describe("admin.panel component", () => {
  it("renders sidebar links and the outlet", () => {
    const markup = renderToStaticMarkup(<AdminPanel />);

    expect(markup).toContain("管理パネル");
    expect(markup).toContain("data-testid=\"panel-outlet\"");

    const paths = navLinkCalls.map((call) => call.to);
    expect(paths).toEqual([
      "/admin/panel",
      "/admin/panel/listStore",
      "/admin/panel/addStore",
      "/admin/panel/editStore",
      "/admin/panel/listHouse",
      "/admin/panel/addHouse",
      "/admin/panel/editHouse",
      "/admin/panel/editRelation",
    ]);
  });
});
