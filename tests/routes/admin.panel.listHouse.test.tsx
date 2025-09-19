import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loader, default as ListHouseRoute } from "../../app/routes/admin.panel.listHouse";

const fetchAllHousesMock = vi.hoisted(() => vi.fn());
const mockedUseLoaderData = vi.hoisted(() => vi.fn());
const linkCalls = vi.hoisted(() => [] as Array<{ to: string }>);

vi.mock("~/lib/supabase/db", () => ({
  fetchAllHouses: fetchAllHousesMock,
}));

vi.mock("~/Hooks/useQueryToast", () => ({
  useQueryToast: vi.fn(),
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
    useLoaderData: () => mockedUseLoaderData(),
    Link: ({ to, children }: { to: string; children: ReactNode }) => {
      linkCalls.push({ to });
      return <a data-link={to}>{children}</a>;
    },
  };
});

beforeEach(() => {
  fetchAllHousesMock.mockReset();
  mockedUseLoaderData.mockReset();
  linkCalls.length = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin.panel.listHouse loader", () => {
  it("fetches all houses", async () => {
    fetchAllHousesMock.mockResolvedValue([{ id: 1 }]);

    const request = new Request("https://example.com/admin/panel/listHouse");
    const result = await loader({ request } as never);

    expect(fetchAllHousesMock).toHaveBeenCalled();
    expect(result).toEqual({ houses: [{ id: 1 }], status: null, type: null });
  });
});

describe("admin.panel.listHouse component", () => {
  it("renders house rows with links", () => {
    const houses = [
      { id: 1, apartment: "Sky Tower", address: "Shibuya", store_id: "S-1", stores: { store: "渋谷店" } },
      { id: 2, apartment: "Blue Tower", address: "Shinjuku", store_id: "S-2", stores: { store: "新宿店" } },
    ];
    mockedUseLoaderData.mockReturnValue({ houses, status: null, type: null });

    const markup = renderToStaticMarkup(<ListHouseRoute />);

    expect(markup).toContain("マンション一覧");
    expect(markup).toContain("Sky Tower");
    expect(markup).toContain("Blue Tower");
    const paths = linkCalls.map((link) => link.to).sort();
    expect(paths).toEqual([
      "/admin/panel/house/1",
      "/admin/panel/house/2",
    ]);
  });
});
