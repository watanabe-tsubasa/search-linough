import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loader, default as ListStoreRoute } from "../../app/routes/admin.panel.listStore";

const fetchStoresMock = vi.hoisted(() => vi.fn());
const mockedUseLoaderData = vi.hoisted(() => vi.fn());
const linkCalls = vi.hoisted(() => [] as Array<{ to: string }>)

vi.mock("~/lib/supabase/db", () => ({
  fetchStores: fetchStoresMock,
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
  fetchStoresMock.mockReset();
  mockedUseLoaderData.mockReset();
  linkCalls.length = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin.panel.listStore loader", () => {
  it("fetches stores eagerly", async () => {
    const sample = [{ id: "1" }];
    fetchStoresMock.mockResolvedValue(sample);

    const result = await loader({} as never);

    expect(fetchStoresMock).toHaveBeenCalledTimes(1);
    expect(result.stores).toBe(sample);
  });
});

describe("admin.panel.listStore component", () => {
  it("renders rows for each store with detail links", () => {
    const stores = [
      { id: "1", store: "渋谷店", store_id: "S-001" },
      { id: "2", store: "青山店", store_id: "S-010" },
    ];
    mockedUseLoaderData.mockReturnValue({ stores });

    const markup = renderToStaticMarkup(<ListStoreRoute />);

    expect(markup).toContain("店舗一覧");
    expect(markup).toContain("渋谷店");
    expect(markup).toContain("青山店");
    expect(linkCalls.map((link) => link.to)).toEqual([
      "/admin/panel/store/S-001",
      "/admin/panel/store/S-010",
    ]);
  });
});
