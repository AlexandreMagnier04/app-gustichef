export type UserRole = 'customer' | 'chef';

export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	firstname: string;
	role: UserRole;
	localization: string;
	upload_profile_picture: string | null;
	createdAt: Date;
	updatedAt: Date;
}
