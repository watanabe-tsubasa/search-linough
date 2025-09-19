import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { action, loader, default as EditRelationRoute } from "../../app/routes/admin.panel.editRelation";

const fetchAllHousesMock = vi.hoisted(() => vi.fn());
const fetchStoresMock = vi.hoisted(() => vi.fn());
const updateHousesStoreMock = vi.hoisted(() => vi.fn());
const mockedUseLoaderData = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("~/lib/supabase/db", () => ({
  fetchAllHouses: fetchAllHousesMock,
  fetchStores: fetchStoresMock,
  updateHousesStore: updateHousesStoreMock,
}));

vi.mock("~/Hooks/useQueryToast", () => ({
  useQueryToast: vi.fn(),
}));

vi.mock("~/Hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("~/components/StoreSearcher", () => ({
  __esModule: true,
  default: ({ value }: { value?: string }) => (
    <div data-store-search>{value ?? ""}</div>
  ),
}));

vi.mock("~/components/Dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div data-dialog>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div data-dialog>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div data-dialog>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div data-dialog>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div data-dialog>{children}</div>,
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
    Form: ({ children, ...props }: { children: ReactNode }) => <form {...props}>{children}</form>,
  };
});

beforeEach(() => {
  fetchAllHousesMock.mockReset();
  fetchStoresMock.mockReset();
  updateHousesStoreMock.mockReset();
  mockedUseLoaderData.mockReset();
  toastMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin.panel.editRelation loader", () => {
  it("loads all houses", async () => {
    fetchAllHousesMock.mockResolvedValue([{ id: 1 }]);
    fetchStoresMock.mockResolvedValue([{ store_id: "S-1", store: "渋谷" }]);

    const request = new Request("https://example.com/admin/panel/editRelation");
    const result = await loader({ request } as never);

    expect(fetchAllHousesMock).toHaveBeenCalled();
    expect(fetchStoresMock).toHaveBeenCalled();
    expect(result).toEqual({ houses: [{ id: 1 }], stores: [{ store_id: "S-1", store: "渋谷" }], status: null, type: null });
  });
});

describe("admin.panel.editRelation action", () => {
  it("redirects with failure when store id or ids missing", async () => {
    const form = new FormData();

    const request = new Request("https://example.com/admin/panel/editRelation", {
      method: "POST",
      body: form,
    });

    const response = await action({ request } as never);

    expect(response.headers.get("Location")).toBe(
      "/admin/panel/editRelation?type=update&status=error",
    );
  });

  it("updates houses and redirects with success flag", async () => {
    updateHousesStoreMock.mockResolvedValue(true);

    const form = new FormData();
    form.set("store_id", "S-1");
    form.append("ids", "1");
    form.append("ids", "2");

    const request = new Request("https://example.com/admin/panel/editRelation", {
      method: "POST",
      body: form,
    });

    const response = await action({ request } as never);

    expect(updateHousesStoreMock).toHaveBeenCalledWith([1, 2], "S-1");
    expect(response.headers.get("Location")).toBe(
      "/admin/panel/editRelation?type=update&status=success",
    );
  });

  it("propagates failure flag when update returns false", async () => {
    updateHousesStoreMock.mockResolvedValue(false);

    const form = new FormData();
    form.set("store_id", "S-1");
    form.append("ids", "1");

    const request = new Request("https://example.com/admin/panel/editRelation", {
      method: "POST",
      body: form,
    });

    const response = await action({ request } as never);

    expect(response.headers.get("Location")).toBe(
      "/admin/panel/editRelation?type=update&status=error",
    );
  });
});

describe("admin.panel.editRelation component", () => {
  it("renders houses for selection", () => {
    mockedUseLoaderData.mockReturnValue({
      houses: [
        {
          id: 1,
          apartment: "Sky Tower",
          address: "Shibuya",
          post: "1500001",
          prefectures: "東京",
          store_id: "S-1",
        },
      ],
      stores: [{ store_id: "S-1", store: "渋谷店" }],
      status: null,
      type: null,
    });

    const markup = renderToStaticMarkup(<EditRelationRoute />);

    expect(markup).toContain("マンション紐付け変更");
    expect(markup).toContain("Sky Tower");
    expect(markup).toContain("選択中:");
  });
});
