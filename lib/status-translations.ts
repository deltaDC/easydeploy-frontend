/**
 * Utility functions để dịch status và các giá trị enum sang tiếng Việt
 */

export const translateStatus = (status: string): string => {
	const statusMap: Record<string, string> = {
		'SUCCESS': 'Thành công',
		'FAILED': 'Thất bại',
		'PENDING': 'Chờ xử lý',
		'IN_PROGRESS': 'Đang xử lý',
		'DEPLOYING': 'Đang triển khai',
		'RUNNING': 'Đang chạy',
		'STOPPED': 'Đã dừng',
		'ERROR': 'Lỗi',
		'IDLE': 'Nhàn rỗi',
	};
	
	return statusMap[status.toUpperCase()] || status;
};

export const translateStatusToEnglish = (statusVi: string): string => {
	const reverseMap: Record<string, string> = {
		'Thành công': 'SUCCESS',
		'Thất bại': 'FAILED',
		'Chờ xử lý': 'PENDING',
		'Đang xử lý': 'IN_PROGRESS',
		'Đang triển khai': 'DEPLOYING',
		'Đang chạy': 'RUNNING',
		'Đã dừng': 'STOPPED',
		'Lỗi': 'ERROR',
		'Nhàn rỗi': 'IDLE',
	};
	
	return reverseMap[statusVi] || statusVi;
};
