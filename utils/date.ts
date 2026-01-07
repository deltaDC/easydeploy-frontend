

export const formatDateDDMMYYYYHHMMSS = (date: string) => {
	if (!date) return "N/A";
	
	// If the date string doesn't have timezone info (from LocalDateTime),
	// treat it as UTC and convert to UTC+7 (Asia/Ho_Chi_Minh)
	let dateObj: Date;
	
	// Check if date string has timezone info (Z, +HH:MM, -HH:MM pattern)
	const hasTimezone = date.includes('Z') || /[+-]\d{2}:\d{2}$/.test(date);
	
	if (!hasTimezone) {
		// Date string without timezone (e.g., "2024-01-01T12:00:00")
		// Append 'Z' to treat it as UTC, then convert to UTC+7
		dateObj = new Date(date + 'Z');
	} else {
		dateObj = new Date(date);
	}
	
	return dateObj.toLocaleString("vi-VN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		timeZone: "Asia/Ho_Chi_Minh", // UTC+7
	});
};

export const formatDate = (date: string) => {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

export const formatDateTime = (date: string) => {
	return new Date(date).toLocaleString("en-US", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
};