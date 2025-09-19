import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { action, loader, default as HouseDetailRoute } from "../../app/routes/admin.panel.house.$houseId";

const fetchHouseMock = vi.hoisted(() => vi.fn());
const updateHouseMock = vi.hoisted(() => vi.fn());
const deleteHouseMock = vi.hoisted(() => vi.fn());
const mockedUseLoaderData = vi.hoisted(() => vi.fn());
const mockedUseActionData = vi.hoisted(() => vi.fn());
const originalConsoleError = console.error;

vi.mock("~/lib/supabase/db", () => ({
  fetchHouse: fetchHouseMock,
  updateHouse: updateHouseMock,
  deleteHouse: deleteHouseMock,
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

beforeEach(() => {
  fetchHouseMock.mockReset();
  updateHouseMock.mockReset();
  deleteHouseMock.mockReset();
  mockedUseLoaderData.mockReset();
  mockedUseActionData.mockReset();
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  vi.clearAllMocks();
});

describe("admin.panel.house.$houseId loader", () => {
  it("fetches house by id", async () => {
    fetchHouseMock.mockResolvedValue({ id: 1 });

    const request = new Request("https://example.com/admin/panel/house/1");
    const result = await loader({ params: { houseId: "1" }, request } as never);

    expect(fetchHouseMock).toHaveBeenCalledWith(1);
    expect(result).toEqual({ house: { id: 1 }, houseId: 1, status: null, type: null });
  });
});

describe("admin.panel.house.$houseId action", () => {
  it("deletes house when intent=delete", async () => {
    deleteHouseMock.mockResolvedValue(undefined);

    const form = new FormData();
    form.set("_action", "delete");

    const request = new Request("https://example.com/admin/panel/house/1", {
      method: "POST",
      body: form,
    });

    const response = await action({ request, params: { houseId: "1" } } as never);

    expect(deleteHouseMock).toHaveBeenCalledWith(1);
    expect(response.headers.get("Location")).toBe(
      "/admin/panel/listHouse?type=delete&status=success",
    );
  });

  it("redirects to detail with failure flag if delete fails", async () => {
    deleteHouseMock.mockRejectedValue(new Error("boom"));

    const form = new FormData();
    form.set("_action", "delete");

    const request = new Request("https://example.com/admin/panel/house/1", {
      method: "POST",
      body: form,
    });

    const response = await action({ request, params: { houseId: "1" } } as never);

    expect(response.headers.get("Location")).toBe(
      "/admin/panel/house/1?type=delete&status=error",
    );
  });

  it("returns validation errors for invalid inputs", async () => {
    const form = new FormData();
    form.set("store_id", "");
    form.set("apartment", "");
    form.set("address", "");
    form.set("post", "abc");
    form.set("prefectures", "");
    form.set("households", "-1");

    const request = new Request("https://example.com/admin/panel/house/1", {
      method: "POST",
      body: form,
    });

    const result = await action({ request, params: { houseId: "1" } } as never);

    expect(result).toMatchObject({
      errors: {
        store_id: expect.any(String),
        apartment: expect.any(String),
        address: expect.any(String),
        post: expect.any(String),
        households: expect.any(String),
      },
    });
  });

  it("updates house and redirects on success", async () => {
    updateHouseMock.mockResolvedValue(undefined);

    const form = new FormData();
    form.set("store_id", "S-1");
    form.set("apartment", "Sky Tower");
    form.set("address", "Shibuya");
    form.set("post", "150-0001");
    form.set("prefectures", "東京");
    form.set("households", "10");

    const request = new Request("https://example.com/admin/panel/house/1", {
      method: "POST",
      body: form,
    });

    const response = await action({ request, params: { houseId: "1" } } as never);

    expect(updateHouseMock).toHaveBeenCalledWith(1, {
      store_id: "S-1",
      apartment: "Sky Tower",
      address: "Shibuya",
      post: "150-0001",
      prefectures: "東京",
      households: 10,
    });
    expect(response.headers.get("Location")).toBe(
      "/admin/panel/house/1?type=update&status=success",
    );
  });

  it("redirects with failure when update errors", async () => {
    updateHouseMock.mockRejectedValue(new Error("boom"));

    const form = new FormData();
    form.set("store_id", "S-1");
    form.set("apartment", "Sky Tower");
    form.set("address", "Shibuya");
    form.set("households", "5");

    const request = new Request("https://example.com/admin/panel/house/1", {
      method: "POST",
      body: form,
    });

    const response = await action({ request, params: { houseId: "1" } } as never);

    expect(response.headers.get("Location")).toBe(
      "/admin/panel/house/1?type=update&status=error",
    );
  });
});

describe("admin.panel.house.$houseId component", () => {
  it("renders detail form and error messages", () => {
    mockedUseLoaderData.mockReturnValue({
      house: {
        store_id: "S-1",
        apartment: "Sky Tower",
        address: "Shibuya",
        post: "1500001",
        prefectures: "東京",
        households: 10,
      },
      houseId: 1,
      status: null,
      type: null,
    });
    mockedUseActionData.mockReturnValue({
      errors: { address: "必須" },
      values: { address: "", store_id: "S-1", apartment: "Sky Tower", post: "", prefectures: "東京", households: 10 },
    });

    const markup = renderToStaticMarkup(<HouseDetailRoute />);

    expect(markup).toContain("マンション詳細");
    expect(markup).toContain("Sky Tower");
    expect(markup).toContain("必須");
  });
});
