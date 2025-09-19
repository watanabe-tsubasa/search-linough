import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { action, loader, default as AddStoreRoute } from "../../app/routes/admin.panel.addStore";

const loaderMock = vi.hoisted(() => vi.fn(async () => ({ status: null, type: null })));
const insertStoreMock = vi.hoisted(() => vi.fn());
const mockedUseLoaderData = vi.hoisted(() => vi.fn());
const addFormPanelCalls = vi.hoisted(() => [] as Array<{ loaderData: unknown; children: ReactNode[] }>);

vi.mock("~/components/AddFormPanel", () => ({
  AddFormPanel: ({ loaderData, children }: { loaderData: unknown; children: ReactNode | ReactNode[] }) => {
    const list = Array.isArray(children) ? children : [children];
    addFormPanelCalls.push({ loaderData, children: list });
    return <div data-testid="add-form-panel">{list}</div>;
  },
  commonAddFormLoader: loaderMock,
}));

vi.mock("~/components/FormUI", () => ({
  FormField: ({ label, name }: { label: string; name: string }) => (
    <label data-field={name}>{label}</label>
  ),
}));

vi.mock("~/lib/supabase/db", () => ({
  insertStore: insertStoreMock,
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
  };
});

const originalConsoleError = console.error;

beforeEach(() => {
  loaderMock.mockClear();
  insertStoreMock.mockReset();
  mockedUseLoaderData.mockReset();
  addFormPanelCalls.length = 0;
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  vi.clearAllMocks();
});

describe("admin.panel.addStore loader", () => {
  it("delegates to common loader", async () => {
    loaderMock.mockResolvedValue({ status: "success", type: "create" });

    const result = await loader({} as never);

    expect(loaderMock).toHaveBeenCalled();
    expect(result).toEqual({ status: "success", type: "create" });
  });
});

describe("admin.panel.addStore action", () => {
  const postHeaders = { "Content-Type": "application/x-www-form-urlencoded" };

  it("persists submitted stores and redirects with success", async () => {
    insertStoreMock.mockResolvedValue({ ok: true });

    const params = new URLSearchParams({
      "stores[0][store_id]": "S-001",
      "stores[0][store]": "渋谷店",
      "stores[1][store_id]": "S-002",
      "stores[1][store]": "新宿店",
    });

    const request = new Request("https://example.com/admin/panel/addStore", {
      method: "POST",
      body: params.toString(),
      headers: postHeaders,
    });

    const response = await action({ request } as never);

    expect(insertStoreMock).toHaveBeenCalledWith([
      { store_id: "S-001", store: "渋谷店" },
      { store_id: "S-002", store: "新宿店" },
    ]);
    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("Location")).toBe(
      "/admin/panel/addStore?type=create&status=success",
    );
  });

  it("redirects with failure when insert throws", async () => {
    insertStoreMock.mockRejectedValue(new Error("boom"));

    const params = new URLSearchParams({
      "stores[0][store_id]": "S-001",
      "stores[0][store]": "渋谷店",
    });

    const request = new Request("https://example.com/admin/panel/addStore", {
      method: "POST",
      body: params.toString(),
      headers: postHeaders,
    });

    const response = await action({ request } as never);

    expect(response.headers.get("Location")).toBe(
      "/admin/panel/addStore?type=create&status=error",
    );
  });
});

describe("admin.panel.addStore component", () => {
  it("renders the AddFormPanel with loader data and default form", () => {
    mockedUseLoaderData.mockReturnValue({ status: "success", type: "create" });

    const markup = renderToStaticMarkup(<AddStoreRoute />);

    expect(markup).toContain("data-testid=\"add-form-panel\"");
    expect(addFormPanelCalls[0]?.loaderData).toEqual({ status: "success", type: "create" });
    expect(addFormPanelCalls[0]?.children).toHaveLength(1);
  });
});
