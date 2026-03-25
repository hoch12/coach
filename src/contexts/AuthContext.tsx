import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getApiUrl } from "@/lib/utils";

export interface User {
    id: number;
    username: string;
    role: string;
    trainer_id?: number | null;
    profile_image?: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (newUser: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }, []);

    const login = useCallback((newToken: string, newUser: User) => {
        localStorage.setItem("token", newToken);
        try {
            localStorage.setItem("user", JSON.stringify(newUser));
        } catch (e) { }
        setToken(newToken);
        setUser(newUser);
    }, []);

    const updateUser = useCallback((newUser: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...newUser };
            try {
                localStorage.setItem("user", JSON.stringify(updated));
            } catch (e) {
                console.warn("Failed to save user to localStorage (likely quota exceeded)", e);
            }
            return updated;
        });
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                }
            }

            // Always sync with backend on mount
            fetch(getApiUrl("/api/auth/me"), {
                headers: { Authorization: `Bearer ${storedToken}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error("Unauthorized");
                    return res.json();
                })
                .then(data => {
                    if (data.user) {
                        setUser(data.user);
                        try {
                            localStorage.setItem("user", JSON.stringify(data.user));
                        } catch (e) {
                            // ignore quota exceeded
                        }
                    }
                })
                .catch(err => {
                    console.error("Auth sync failed:", err);
                    if (err.message === "Unauthorized") logout();
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
