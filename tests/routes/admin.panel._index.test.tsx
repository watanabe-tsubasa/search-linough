import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import AdminPanelIndex from "../../app/routes/admin.panel._index";

vi.mock("virtual:react-router/with-props", () => ({
  __esModule: true,
  withComponentProps: <T,>(component: T) => component,
  withErrorBoundary: <T,>(component: T) => component,
  withProps: <T,>(component: T) => component,
}));

describe("admin.panel._index component", () => {
  it("shows the admin welcome copy", () => {
    const markup = renderToStaticMarkup(<AdminPanelIndex />);

    expect(markup).toContain("管理メニューへようこそ");
    expect(markup).toContain("店舗管理");
    expect(markup).toContain("マンション管理");
  });
});
