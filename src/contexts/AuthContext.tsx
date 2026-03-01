import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface UserProfile {
    id: string;
    email: string;
    role: "admin" | "student";
    created_at?: string;

    // Optional fields (used in UI)
    name?: string;
    approved?: boolean;
    batch_id?: string;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    refreshProfile: async () => { },
    signOut: async () => { },
});

export const AuthProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (email: string) => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                setProfile(null);
            } else {
                setProfile(data as UserProfile);
            }
        } catch (e) {
            console.error(e);
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user?.email) {
            await fetchProfile(user.email);
        }
    };

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser?.email) {
                fetchProfile(currentUser.email).finally(() =>
                    setLoading(false)
                );
            } else {
                setLoading(false);
            }
        });

        // Listen for login/logout changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser?.email) {
                fetchProfile(currentUser.email).finally(() =>
                    setLoading(false)
                );
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{ user, profile, loading, refreshProfile, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};