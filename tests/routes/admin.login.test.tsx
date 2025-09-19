import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { action, default as AdminLogin } from "../../app/routes/admin.login";

const signInWithPasswordMock = vi.hoisted(() => vi.fn());
const getSessionMock = vi.hoisted(() => vi.fn());
const commitSessionMock = vi.hoisted(() => vi.fn());
const mockedUseActionData = vi.hoisted(() => vi.fn());

vi.mock("~/lib/supabase/server", () => ({
  supabase: {
    auth: {
      signInWithPassword: signInWithPasswordMock,
    },
  },
}));

vi.mock("~/lib/session.server", () => ({
  getSession: getSessionMock,
  commitSession: commitSessionMock,
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
    useActionData: () => mockedUseActionData(),
    Form: (props: any) => <form {...props} />,
  };
});

beforeEach(() => {
  signInWithPasswordMock.mockReset();
  getSessionMock.mockReset();
  commitSessionMock.mockReset();
  mockedUseActionData.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("admin.login action", () => {
  const postHeaders = { "Content-Type": "application/x-www-form-urlencoded" };

  it("returns a validation error when fields are blank", async () => {
    const request = new Request("https://example.com/admin/login", {
      method: "POST",
      body: new URLSearchParams().toString(),
      headers: postHeaders,
    });

    const result = await action({ request } as never);

    expect(result).toEqual({ error: "メールアドレスとパスワードを入力してください。" });
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });

  it("returns an error message when Supabase rejects the credentials", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: { message: "Invalid" } });

    const params = new URLSearchParams({ email: "admin@example.com", password: "bad" });
    const request = new Request("https://example.com/admin/login", {
      method: "POST",
      body: params.toString(),
      headers: postHeaders,
    });

    const result = await action({ request } as never);

    expect(result).toEqual({ error: "ログインに失敗しました。" });
    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "bad",
    });
  });

  it("sets the session cookie and redirects on success", async () => {
    const setMock = vi.fn();
    signInWithPasswordMock.mockResolvedValue({ error: null });
    getSessionMock.mockResolvedValue({ set: setMock });
    commitSessionMock.mockResolvedValue("cookie=value");

    const params = new URLSearchParams({ email: "admin@example.com", password: "secret" });
    const request = new Request("https://example.com/admin/login", {
      method: "POST",
      body: params.toString(),
      headers: postHeaders,
    });

    const response = await action({ request } as never);

    expect(setMock).toHaveBeenCalledWith("authenticated", true);
    expect(commitSessionMock).toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("Set-Cookie")).toBe("cookie=value");
    expect(response.headers.get("Location")).toBe("/admin/panel");
    expect(response.status).toBe(302);
  });
});

describe("admin.login component", () => {
  it("renders the login form", () => {
    mockedUseActionData.mockReturnValue(undefined);

    const markup = renderToStaticMarkup(<AdminLogin />);

    expect(markup).toContain("Admin Login");
    expect(markup).toContain("Email address");
    expect(markup).toContain("Password");
    expect(markup).toContain("Sign in");
  });

  it("displays action errors when provided", () => {
    mockedUseActionData.mockReturnValue({ error: "失敗" });

    const markup = renderToStaticMarkup(<AdminLogin />);

    expect(markup).toContain("失敗");
    expect(markup).toContain("role=\"alert\"");
  });
});
