import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { action, loader, default as StoreDetailRoute } from "../../app/routes/admin.panel.store.$storeId";

const fetchStoreByIdMock = vi.hoisted(() => vi.fn());
const updateStoreMock = vi.hoisted(() => vi.fn());
const mockedUseLoaderData = vi.hoisted(() => vi.fn());
const mockedUseActionData = vi.hoisted(() => vi.fn());

vi.mock("~/lib/supabase/db", () => ({
  fetchStoreById: fetchStoreByIdMock,
  updateStore: updateStoreMock,
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
    useActionData: () => mockedUseActionData(),
    Form: ({ children, ...props }: { children: ReactNode }) => <form {...props}>{children}</form>,
  };
});

const originalConsoleError = console.error;

beforeEach(() => {
  fetchStoreByIdMock.mockReset();
  updateStoreMock.mockReset();
  mockedUseLoaderData.mockReset();
  mockedUseActionData.mockReset();
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  vi.clearAllMocks();
});

describe("admin.panel.store.$storeId loader", () => {
  it("fetches store by id", async () => {
    fetchStoreByIdMock.mockResolvedValue({ id: "S-1" });

    const request = new Request("https://example.com/admin/panel/store/S-1");
    const result = await loader({ params: { storeId: "S-1" }, request } as never);

    expect(fetchStoreByIdMock).toHaveBeenCalledWith("S-1");
    expect(result).toEqual({ store: { id: "S-1" }, storeId: "S-1", status: null, type: null });
  });
});

describe("admin.panel.store.$storeId action", () => {
  it("returns validation errors when required fields missing", async () => {
    const form = new FormData();

    const request = new Request("https://example.com/admin/panel/store/S-1", {
      method: "POST",
      body: form,
    });

    const result = await action({ request, params: { storeId: "S-1" } } as never);

    expect(result).toEqual({
      errors: {
        store_id: "店舗コードを入力してください",
        store: "店舗名を入力してください",
      },
      values: { store: "", store_id: "" },
    });
  });

  it("updates store and redirects with success", async () => {
    updateStoreMock.mockResolvedValue(undefined);

    const form = new FormData();
    form.set("store", "渋谷店");
    form.set("store_id", "S-2");

    const request = new Request("https://example.com/admin/panel/store/S-1", {
      method: "POST",
      body: form,
    });

    const response = await action({ request, params: { storeId: "S-1" } } as never);

    expect(updateStoreMock).toHaveBeenCalledWith("S-1", { store: "渋谷店", store_id: "S-2" });
    expect(response.headers.get("Location")).toBe(
      "/admin/panel/store/S-2?type=update&status=success",
    );
  });

  it("redirects with failure on update error", async () => {
    updateStoreMock.mockRejectedValue(new Error("boom"));

    const form = new FormData();
    form.set("store", "渋谷店");
    form.set("store_id", "S-2");

    const request = new Request("https://example.com/admin/panel/store/S-1", {
      method: "POST",
      body: form,
    });

    const response = await action({ request, params: { storeId: "S-1" } } as never);

    expect(response.headers.get("Location")).toBe(
      "/admin/panel/store/S-1?type=update&status=error",
    );
  });
});

describe("admin.panel.store.$storeId component", () => {
  it("renders store form and surfaces validation errors", () => {
    mockedUseLoaderData.mockReturnValue({
      store: { store_id: "S-1", store: "渋谷店" },
      storeId: "S-1",
      status: null,
      type: null,
    });
    mockedUseActionData.mockReturnValue({
      errors: { store: "必須" },
      values: { store: "", store_id: "S-1" },
    });

    const markup = renderToStaticMarkup(<StoreDetailRoute />);

    expect(markup).toContain("店舗詳細");
    expect(markup).toContain('value="S-1"');
    expect(markup).toContain("必須");
  });
});
