import type { JSX } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loader, default as StoreDetails } from "../../app/routes/search.result";

const fetchHousesMock = vi.hoisted(() => vi.fn());
const mockedUseLoaderData = vi.hoisted(() => vi.fn());
const mockedUseNavigation = vi.hoisted(() => vi.fn());
let awaitedValue: unknown = null;

vi.mock("~/lib/supabase/db", () => ({
  fetchHouses: fetchHousesMock,
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
    useNavigation: () => mockedUseNavigation(),
    Await: ({ children }: { children: (resolved: unknown) => JSX.Element }) => {
      if (typeof children === "function") {
        return children(awaitedValue);
      }
      return null;
    },
  };
});

const HouseCardsMock = vi.hoisted(() =>
  vi.fn((props: { houses: unknown; addressSearchTerm: string }) => (
    <div data-testid="house-cards" data-address={props.addressSearchTerm} />
  )),
);
const FakeHouseCardsMock = vi.hoisted(() => vi.fn(() => <div data-testid="fake-house-cards" />));

vi.mock("~/components/HouseSearcher", () => ({
  HouseCards: HouseCardsMock,
  FakeHouseCards: FakeHouseCardsMock,
}));

beforeEach(() => {
  fetchHousesMock.mockReset();
  mockedUseLoaderData.mockReset();
  mockedUseNavigation.mockReset();
  HouseCardsMock.mockClear();
  FakeHouseCardsMock.mockClear();
  awaitedValue = null;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("search.result loader", () => {
  it("parses query params and requests houses with store_id", async () => {
    const housesPromise = Promise.resolve([{ id: "1" }]);
    fetchHousesMock.mockReturnValue(housesPromise);

    const request = new Request("https://example.com/search/result?store=Alpha&store_id=123");
    const result = await loader({ request } as never);

    expect(result.store).toBe("Alpha");
    expect(fetchHousesMock).toHaveBeenCalledWith("123");
    const expected = await housesPromise;
    await expect(result.housesPromise).resolves.toEqual(expected);
  });

  it("falls back to empty id when store_id is missing", async () => {
    const housesPromise = Promise.resolve([]);
    fetchHousesMock.mockReturnValue(housesPromise);

    const request = new Request("https://example.com/search/result?store=Alpha");
    await loader({ request } as never);

    expect(fetchHousesMock).toHaveBeenCalledWith("");
  });
});

describe("search.result component", () => {
  it("renders store name and forwards houses to HouseCards", () => {
    const houses = [{ id: "1" }];
    const housesPromise = Promise.resolve(houses);
    awaitedValue = houses;

    mockedUseLoaderData.mockReturnValue({ store: "渋谷店", housesPromise });
    mockedUseNavigation.mockReturnValue({ state: "idle", formData: undefined });

    const markup = renderToStaticMarkup(<StoreDetails />);

    expect(markup).toContain("渋谷店");
    expect(HouseCardsMock).toHaveBeenCalledTimes(1);
    expect(HouseCardsMock.mock.calls[0][0].houses).toBe(houses);
    expect(HouseCardsMock.mock.calls[0][0].addressSearchTerm).toBe("");
  });

  it("prefers transition store label and shows loading state while submitting", () => {
    const houses = [{ id: "1" }];
    const housesPromise = Promise.resolve(houses);
    awaitedValue = houses;

    const formData = new FormData();
    formData.set("store", "新宿店");

    mockedUseLoaderData.mockReturnValue({ store: "渋谷店", housesPromise });
    mockedUseNavigation.mockReturnValue({ state: "submitting", formData });

    const markup = renderToStaticMarkup(<StoreDetails />);

    expect(markup).toContain("新宿店");
    expect(markup).toContain("text-gray-400");
    expect(markup).toContain("animate-spin");
  });
});
