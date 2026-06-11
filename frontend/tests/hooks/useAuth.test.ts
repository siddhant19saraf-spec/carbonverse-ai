import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
  localStorage.clear();
});

describe("useAuth", () => {
  it("initializes with loading state", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.tokens).toBeNull();
  });

  it("loads session from localStorage on mount", async () => {
    const tokens = { access_token: "test-access", refresh_token: "test-refresh", token_type: "bearer" };
    localStorage.setItem("tokens", JSON.stringify(tokens));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "1", email: "test@test.com", username: "testuser", role: "user", is_active: true, sustainability_score: 50, carbon_saved: 10, green_level: 2, streak_days: 5 }),
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).not.toBeNull();
  });

  it("clears session on mount if token is invalid", async () => {
    localStorage.setItem("tokens", JSON.stringify({ access_token: "invalid", refresh_token: "invalid", token_type: "bearer" }));

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Invalid" }),
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
