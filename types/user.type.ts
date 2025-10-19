export type UserRole = 'ADMIN' | 'DEVELOPER';

export type User = {
	id: string;
	email: string;
	githubUsername?: string;
	avatarUrl?: string;
	roles: Set<string>;
	createdAt?: string;
	updatedAt?: string;
	isActive?: boolean;
};

export type LoginRequest = {
	email: string;
	password: string;
};

export type RegisterRequest = {
	email: string;
	password: string;
};

export type AuthResponse = {
	token: string;
	type: string;
	userId: string;
	email: string;
	githubUsername?: string;
	avatarUrl?: string;
	roles: Set<string> | string[]; // Handle both Set and Array from JSON
	message: string;
};

export type AuthError = {
	message: string;
	field?: string;
	code?: string;
};

export type GitHubAuthResponse = {
	token: string;
	type: string;
	userId: string;
	email: string;
	githubUsername?: string;
	avatarUrl?: string;
	roles: Set<string>;
	message: string;
	isNewUser: boolean;
};
