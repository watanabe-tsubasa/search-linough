import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loader, default as AdminIndex } from "../../app/routes/admin._index";

const mockedUseLoaderData = vi.hoisted(() => vi.fn());
const linkCalls = vi.hoisted(() => [] as Array<{ to: string }>)

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
  mockedUseLoaderData.mockReset();
  linkCalls.length = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin._index loader", () => {
  it("returns identifier data", async () => {
    await expect(loader()).resolves.toEqual({ data: "admin index" });
  });
});

describe("admin._index component", () => {
  it("shows entry links to login and panel", () => {
    mockedUseLoaderData.mockReturnValue({ data: "admin index" });

    const markup = renderToStaticMarkup(<AdminIndex />);

    expect(markup).toContain("管理画面トップ admin index");
    expect(linkCalls.map((link) => link.to)).toEqual([
      "/admin/login",
      "/admin/panel",
    ]);
  });
});
