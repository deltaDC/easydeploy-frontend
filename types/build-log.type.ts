export type BuildLog = {
	id: string;
	buildId: string;
	timestamp: string;
	content: string;
	lineNumber?: number;
};

export type BuildLogPageResponse = {
	content: BuildLog[];
	page: {
		size: number;
		number: number;
		totalElements: number;
		totalPages: number;
	};
};

export type BuildLogMessage = {
	buildId: string;
	applicationId: string;
	message: string;
	logLevel: string;
	timestamp: string;
	logLineNumber?: number;
};

