// Notification destinée à un user
export interface Notification {
	id_notification: number;
	id_user: string;
	type: string;
	title: string;
	body: string;
	read: boolean;
	id_request: string | null;
	created_at: Date;
}
