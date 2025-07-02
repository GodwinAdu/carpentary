"use client";

import { currentUser } from "@/lib/helpers/session";
import { useEffect, useState } from "react";

export function useCurrentUser() {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulate fetching current user data
        const fetchCurrentUser = async () => {
            try {
                // Replace with actual API call
                const userData = await currentUser(); // Assuming currentUser is a function that fetches user data0
                setUser(userData);
            } catch (err) {
                console.error("Error fetching current user:", err);
                setError("Failed to fetch current user");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    return { user, isLoading, error };
}