import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { action, loader, meta, default as SearchRoute } from "../../app/routes/search";

const storeSearchCalls = vi.hoisted(() => [] as Array<Record<string, unknown>>);
const StoreSearchMock = vi.hoisted(() =>
  vi.fn((props: Record<string, unknown>) => {
    storeSearchCalls.push(props);
    return <div data-testid="store-search" />;
  }),
);
const mockedUseLoaderData = vi.hoisted(() => vi.fn());
const fetchStoresMock = vi.hoisted(() => vi.fn());

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
    Outlet: () => <div data-testid="route-outlet" />,
  };
});

vi.mock("~/components/StoreSearcher", () => ({
  __esModule: true,
  default: StoreSearchMock,
}));

beforeEach(() => {
  mockedUseLoaderData.mockReset();
  fetchStoresMock.mockReset();
  StoreSearchMock.mockClear();
  storeSearchCalls.length = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("search route meta", () => {
  it("returns title and description tags", () => {
    const result = meta({} as never);
    expect(result).toEqual([
      { title: "linough searcher" },
      { name: "description", content: "search linough adapted apartment" },
    ]);
  });
});

describe("search route loader", () => {
  it("returns the fetchStores promise without awaiting", async () => {
    const storesPromise = Promise.resolve([{ id: 1 }]);
    fetchStoresMock.mockReturnValue(storesPromise);

    const result = await loader();

    expect(fetchStoresMock).toHaveBeenCalledTimes(1);
    const expected = await storesPromise;
    await expect(result.stores).resolves.toEqual(expected);
  });
});

describe("search route action", () => {
  const postHeaders = { "Content-Type": "application/x-www-form-urlencoded" };

  it("redirects back to /search when store is missing", async () => {
    const request = new Request("https://example.com/search", {
      method: "POST",
      body: new URLSearchParams().toString(),
      headers: postHeaders,
    });

    const response = await action({ request });

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("Location")).toBe("/search");
    expect(response.status).toBe(302);
  });

  it("redirects to the result page with encoded params", async () => {
    const params = new URLSearchParams();
    params.set("store", "銀座店");
    params.set("storeId", "42");

    const request = new Request("https://example.com/search", {
      method: "POST",
      body: params.toString(),
      headers: postHeaders,
    });

    const response = await action({ request });

    expect(response.headers.get("Location")).toBe(
      "/search/result?store=%E9%8A%80%E5%BA%A7%E5%BA%97&store_id=42",
    );
    expect(response.status).toBe(302);
  });
});

describe("search route component", () => {
  it("renders the heading and passes loader data to StoreSearch", () => {
    const mockStores = Promise.resolve([]);
    mockedUseLoaderData.mockReturnValue({ stores: mockStores });

    const markup = renderToStaticMarkup(<SearchRoute />);

    expect(markup).toContain("店舗検索");
    expect(markup).toContain("data-testid=\"route-outlet\"");
    expect(StoreSearchMock).toHaveBeenCalledTimes(1);
    expect(storeSearchCalls[0]?.stores).toBe(mockStores);
  });
});
