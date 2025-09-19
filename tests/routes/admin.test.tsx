import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { loader, meta, default as AdminRoute } from "../../app/routes/admin";

const mockedUseLoaderData = vi.hoisted(() => vi.fn());

vi.mock("@radix-ui/react-toast", () => ({
  ToastProvider: ({ children }: { children: ReactNode }) => <div data-testid="toast-provider">{children}</div>,
}));

vi.mock("~/components/ToastRender", () => ({
  ToastRenderer: () => <div data-testid="toast-renderer" />,
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
    Outlet: () => <div data-testid="admin-outlet" />,
  };
});

beforeEach(() => {
  mockedUseLoaderData.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin route meta", () => {
  it("exposes admin metadata", () => {
    expect(meta({} as never)).toEqual([
      { title: "linough searcher admin" },
      { name: "description", content: "edit linough relative data" },
    ]);
  });
});

describe("admin route loader", () => {
  it("returns a static data payload", async () => {
    await expect(loader()).resolves.toEqual({ data: "admin" });
  });
});

describe("admin route component", () => {
  it("wraps children with the toast provider", () => {
    mockedUseLoaderData.mockReturnValue({ data: "admin" });

    const markup = renderToStaticMarkup(<AdminRoute />);

    expect(markup).toContain("data-testid=\"toast-provider\"");
    expect(markup).toContain("data-testid=\"toast-renderer\"");
    expect(markup).toContain("data-testid=\"admin-outlet\"");
  });
});
