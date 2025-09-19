import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { action, loader, default as AddHouseRoute } from "../../app/routes/admin.panel.addHouse";

const commonLoaderMock = vi.hoisted(() => vi.fn(async () => ({ status: null, type: null })));
const fetchStoresMock = vi.hoisted(() => vi.fn(async () => [{ store_id: "S-1", store: "渋谷店" }]))
const insertHouseMock = vi.hoisted(() => vi.fn());
const mockedUseLoaderData = vi.hoisted(() => vi.fn());
const addFormPanelCalls = vi.hoisted(() => [] as Array<{ loaderData: unknown; children: ReactNode[] }>);
const storeInputCalls = vi.hoisted(() => [] as Array<{ stores: unknown }>)

vi.mock("~/components/AddFormPanel", () => ({
  AddFormPanel: ({ loaderData, children }: { loaderData: unknown; children: ReactNode | ReactNode[] }) => {
    const list = Array.isArray(children) ? children : [children];
    addFormPanelCalls.push({ loaderData, children: list });
    return <div data-testid="add-house-panel">{list}</div>;
  },
  commonAddFormLoader: commonLoaderMock,
}));

vi.mock("~/components/FormUI", () => ({
  FormField: ({ label, name }: { label: string; name: string }) => (
    <label data-field={name}>{label}</label>
  ),
  StoreSearchFormInput: (props: { stores: unknown }) => {
    storeInputCalls.push({ stores: props.stores });
    return <div data-testid="store-search-input" />;
  },
}));

vi.mock("~/lib/supabase/db", () => ({
  fetchStores: fetchStoresMock,
  insertHouse: insertHouseMock,
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
  commonLoaderMock.mockClear();
  fetchStoresMock.mockClear();
  insertHouseMock.mockReset();
  mockedUseLoaderData.mockReset();
  addFormPanelCalls.length = 0;
  storeInputCalls.length = 0;
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  vi.clearAllMocks();
});

describe("admin.panel.addHouse loader", () => {
  it("combines generic loader results with stores", async () => {
    commonLoaderMock.mockResolvedValue({ status: "success", type: "create" });
    fetchStoresMock.mockResolvedValue([{ store_id: "A", store: "A店" }]);

    const result = await loader({} as never);

    expect(commonLoaderMock).toHaveBeenCalled();
    expect(fetchStoresMock).toHaveBeenCalled();
    expect(result).toEqual({ status: "success", type: "create", stores: [{ store_id: "A", store: "A店" }] });
  });
});

describe("admin.panel.addHouse action", () => {
  const postHeaders = { "Content-Type": "application/x-www-form-urlencoded" };

  it("persists submitted houses and redirects with success flag", async () => {
    insertHouseMock.mockResolvedValue(undefined);

    const params = new URLSearchParams({
      "houses[0][store_id]": "S-001",
      "houses[0][apartment]": "Sky Tower",
      "houses[0][address]": "Shibuya",
      "houses[0][post]": "1500001",
      "houses[0][prefectures]": "東京",
      "houses[0][households]": "20",
    });

    const request = new Request("https://example.com/admin/panel/addHouse", {
      method: "POST",
      body: params.toString(),
      headers: postHeaders,
    });

    const response = await action({ request } as never);

    expect(insertHouseMock).toHaveBeenCalledWith([
      {
        store_id: "S-001",
        apartment: "Sky Tower",
        address: "Shibuya",
        post: "1500001",
        prefectures: "東京",
        households: 20,
      },
    ]);
    expect(response.headers.get("Location")).toBe(
      "/admin/panel/addHouse?type=create&status=success",
    );
  });

  it("redirects with failure when insert throws", async () => {
    insertHouseMock.mockRejectedValue(new Error("boom"));

    const params = new URLSearchParams({
      "houses[0][store_id]": "S-001",
      "houses[0][apartment]": "Sky Tower",
    });

    const request = new Request("https://example.com/admin/panel/addHouse", {
      method: "POST",
      body: params.toString(),
      headers: postHeaders,
    });

    const response = await action({ request } as never);

    expect(response.headers.get("Location")).toBe(
      "/admin/panel/addHouse?type=create&status=error",
    );
  });
});

describe("admin.panel.addHouse component", () => {
  it("passes loader data and stores down to child forms", () => {
    mockedUseLoaderData.mockReturnValue({ status: "success", type: "create", stores: [{ store_id: "S-1", store: "渋谷店" }] });

    const markup = renderToStaticMarkup(<AddHouseRoute />);

    expect(markup).toContain("data-testid=\"add-house-panel\"");
    expect(addFormPanelCalls[0]?.loaderData).toEqual({ status: "success", type: "create" });
    expect(storeInputCalls[0]?.stores).toEqual([{ store_id: "S-1", store: "渋谷店" }]);
  });
});
