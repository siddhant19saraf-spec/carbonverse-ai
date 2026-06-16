"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import type { User, Tokens } from "@/types";

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    full_name?: string,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const storedTokens = localStorage.getItem("tokens");
      if (storedTokens) {
        const parsedTokens = JSON.parse(storedTokens) as Tokens;
        setTokens(parsedTokens);
        const userData = await api.get<User>("/auth/me", parsedTokens.access_token);
        setUser(userData);
      }
    } catch {
      localStorage.removeItem("tokens");
      setTokens(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const doRefreshToken = useCallback(async (): Promise<boolean> => {
    let currentTokens: Tokens | null = null;
    try {
      const stored = localStorage.getItem("tokens");
      if (stored) currentTokens = JSON.parse(stored) as Tokens;
    } catch {
      return false;
    }
    if (!currentTokens?.refresh_token) return false;

    try {
      const data = await api.post<Tokens>("/auth/refresh", {
        refresh_token: currentTokens.refresh_token,
      });
      setTokens(data);
      localStorage.setItem("tokens", JSON.stringify(data));
      return true;
    } catch {
      setUser(null);
      setTokens(null);
      localStorage.removeItem("tokens");
      return false;
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<Tokens>("/auth/login", { email, password });
    setTokens(data);
    localStorage.setItem("tokens", JSON.stringify(data));
    const userData = await api.get<User>("/auth/me", data.access_token);
    setUser(userData);
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    full_name?: string,
  ) => {
    await api.post<User>("/auth/register", {
      email,
      username,
      password,
      full_name,
    });
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem("tokens");
  };

  const refreshUser = useCallback(async () => {
    let currentTokens = tokens;
    if (!currentTokens) {
      try {
        const stored = localStorage.getItem("tokens");
        if (stored) currentTokens = JSON.parse(stored) as Tokens;
      } catch {
        return;
      }
    }
    if (!currentTokens) return;

    try {
      const userData = await api.get<User>(
        "/auth/me",
        currentTokens.access_token,
      );
      setUser(userData);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const refreshed = await doRefreshToken();
        if (refreshed) {
          const latestTokens = localStorage.getItem("tokens");
          if (latestTokens) {
            const parsed = JSON.parse(latestTokens) as Tokens;
            try {
              const userData = await api.get<User>(
                "/auth/me",
                parsed.access_token,
              );
              setUser(userData);
            } catch {
              // ignore
            }
          }
        }
      }
    }
  }, [tokens, doRefreshToken]);

  return {
    user,
    tokens,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    refreshToken: doRefreshToken,
  };
}
