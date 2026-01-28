"use client";

import { authService, type User } from "@/lib/auth";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    authService.getCurrentUser(),
  );
  const [isLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const { user } = await authService.login(email, password);
    setUser(user);
    router.push("/dashboard");
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
  }) => {
    const { user } = await authService.register(data);
    setUser(user);
    router.push("/dashboard");
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  const updateProfile = async (data: { name?: string; avatar?: string }) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
