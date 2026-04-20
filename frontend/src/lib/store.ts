// src/lib/auth-store.ts
import { Store } from "@tanstack/react-store";

type User = {
	id: number;
	email: string;
	name?: string;
};

type AuthState = {
	token: string | null;
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
};

const TOKEN_KEY = "auth_token";

export const authStore = new Store<AuthState>({
	token: localStorage.getItem(TOKEN_KEY),
	user: null,
	isAuthenticated: false,
	isLoading: true,
});

export function setAuth(token: string, user: User) {
	localStorage.setItem(TOKEN_KEY, token);

	authStore.setState((state) => ({
		...state,
		token,
		user,
		isAuthenticated: true,
		isLoading: false,
	}));
}

export function clearAuth() {
	localStorage.removeItem(TOKEN_KEY);

	authStore.setState((state) => ({
		...state,
		token: null,
		user: null,
		isAuthenticated: false,
		isLoading: false,
	}));
}

export function setAuthLoading(isLoading: boolean) {
	authStore.setState((state) => ({
		...state,
		isLoading,
	}));
}
