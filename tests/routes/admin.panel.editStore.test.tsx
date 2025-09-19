import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { action, loader, default as EditStoreRoute } from "../../app/routes/admin.panel.editStore";

const fetchStoresMock = vi.hoisted(() => vi.fn());
const updateStoreMock = vi.hoisted(() => vi.fn());
const deleteStoreMock = vi.hoisted(() => vi.fn());
const mockedUseLoaderData = vi.hoisted(() => vi.fn());
const mockedUseFetcher = vi.hoisted(() => vi.fn());
const useQueryToastMock = vi.hoisted(() => vi.fn());

vi.mock("~/lib/supabase/db", () => ({
  fetchStores: fetchStoresMock,
  updateStore: updateStoreMock,
  deleteStore: deleteStoreMock,
}));

vi.mock("~/Hooks/useQueryToast", () => ({
  useQueryToast: useQueryToastMock,
}));

vi.mock("~/components/Dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-dialog>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-dialog>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-dialog>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-dialog>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-dialog>{children}</div>,
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
    useFetcher: () => mockedUseFetcher(),
  };
});

beforeEach(() => {
  fetchStoresMock.mockReset();
  updateStoreMock.mockReset();
  deleteStoreMock.mockReset();
  mockedUseLoaderData.mockReset();
  mockedUseFetcher.mockReset();
  useQueryToastMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin.panel.editStore loader", () => {
  it("fetches stores and exposes query params", async () => {
    fetchStoresMock.mockResolvedValue([{ store_id: "S-1" }]);

    const request = new Request("https://example.com/admin/panel/editStore?type=update&status=success");
    const result = await loader({ request } as never);

    expect(fetchStoresMock).toHaveBeenCalled();
    expect(result).toEqual({ stores: [{ store_id: "S-1" }], type: "update", status: "success" });
  });
});

describe("admin.panel.editStore action", () => {
  it("updates stores when intent=update", async () => {
    updateStoreMock.mockResolvedValue(undefined);

    const form = new FormData();
    form.set("intent", "update");
    form.set("payload", JSON.stringify([{ store_id: "S-1", store: "渋谷" }]));

    const request = new Request("https://example.com/admin/panel/editStore", {
      method: "POST",
      body: form,
    });

    const response = await action({ request } as never);

    expect(updateStoreMock).toHaveBeenCalledWith("S-1", { store: "渋谷" });
    expect(response.headers.get("Location")).toBe("/admin/panel/editStore?type=update&status=success");
  });

  it("deletes stores when intent=delete", async () => {
    deleteStoreMock.mockResolvedValue(undefined);

    const form = new FormData();
    form.set("intent", "delete");
    form.set("ids", JSON.stringify(["S-1", "S-2"]));

    const request = new Request("https://example.com/admin/panel/editStore", {
      method: "POST",
      body: form,
    });

    const response = await action({ request } as never);

    expect(deleteStoreMock).toHaveBeenCalledTimes(2);
    expect(response.headers.get("Location")).toBe("/admin/panel/editStore?type=delete&status=success");
  });

  it("returns 400 for unknown intents", async () => {
    const form = new FormData();

    const request = new Request("https://example.com/admin/panel/editStore", {
      method: "POST",
      body: form,
    });

    const response = await action({ request } as never);

    expect(response.status).toBe(400);
  });

  it("redirects with error on failure", async () => {
    updateStoreMock.mockRejectedValue(new Error("boom"));

    const form = new FormData();
    form.set("intent", "update");
    form.set("payload", JSON.stringify([{ store_id: "S-1", store: "渋谷" }]));

    const request = new Request("https://example.com/admin/panel/editStore", {
      method: "POST",
      body: form,
    });

    const response = await action({ request } as never);

    expect(response.headers.get("Location")).toBe("/admin/panel/editStore?status=error");
  });
});

describe("admin.panel.editStore component", () => {
  it("renders store cards and wires query toast", () => {
    const submitMock = vi.fn();
    mockedUseLoaderData.mockReturnValue({
      stores: [
        { store_id: "S-1", store: "渋谷店" },
        { store_id: "S-2", store: "新宿店" },
      ],
      type: "update",
      status: "success",
    });
    mockedUseFetcher.mockReturnValue({ submit: submitMock, state: "idle" });

    const markup = renderToStaticMarkup(<EditStoreRoute />);

    expect(markup).toContain("店舗変更・削除");
    expect(markup).toContain("渋谷店");
    expect(markup).toContain("新宿店");
    expect(useQueryToastMock).toHaveBeenCalledWith({
      query: { status: "success", type: "update" },
      messages: expect.any(Object),
      basePath: "/admin/panel/editStore",
    });
  });
});
