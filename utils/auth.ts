export function normalizeRoles(roles: Set<string> | string[] | undefined): Set<string> {
	if (!roles) return new Set();
	if (roles instanceof Set) return roles;
	if (Array.isArray(roles)) return new Set(roles);
	return new Set();
}
