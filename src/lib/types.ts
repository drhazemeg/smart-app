export const UPLOAD_STATUS = {
	PENDING: "pending",
	UPLOADING: "uploading",
	PAUSED: "paused",
	COMPLETED: "completed",
	ERROR: "error"
} as const;

export const UPLOADER_CONFIG = {
	DEFAULT_ENDPOINT: "/api/upload",
	DEFAULT_CONCURRENT_LIMIT: 5,
	DEFAULT_RETRY_DELAYS: [0, 3000, 5000, 10_000] as number[],
	MAX_FILE_LIST_HEIGHT: 300,
	PROGRESS_BAR_HEIGHT: 1.5,
	CHUNK_SIZE: 25 * 1024 * 1024
} as const;
export const COMMON_FILE_EXTENSIONS = [
	"exe",
	"bat",
	"sh",
	"cmd",
	"js",
	"ts",
	"jsx",
	"tsx",
	"py",
	"rb",
	"php",
	"dll",
	"msi",
	"apk",
	"dmg",
	"iso",
	"zip",
	"rar",
	"7z",
	"tar",
	"gz"
];
export const unknownError = "An unknown error occurred. Please try again later.";

export type UploadStatus = (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS];

export interface UploadControl {
	cancel: () => void;
	pause: () => void;
	start: () => void;
}

export interface FileUploadState {
	progress: number;
	status: UploadStatus;
}

export interface FileRow {
	filename: string;
	id: string;
	mimeType: string;
	size: number;
	slug: string;
}

export interface FolderRow {
	createdAt: Date;
	id: string;
	name: string;
	parentId: string | null;
	updatedAt: Date;
	userId: string;
}

export type SnakeToCamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
	? `${Lowercase<Head>}${Capitalize<SnakeToCamelCase<Tail>>}`
	: Lowercase<S>;

export type CamelCaseKeys<T> =
	T extends Array<infer U>
		? CamelCaseKeys<U>[]
		: T extends object
			? {
					[K in keyof T as SnakeToCamelCase<K & string>]: CamelCaseKeys<T[K]>;
				}
			: T;
