import { eq, isNull, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { customers, requests } from '$lib/server/db/schema/customers';
import { services } from '$lib/server/db/schema/services';
import { users } from '$lib/server/db/schema/auth';
import { chiefs_specialties, specialties } from '$lib/server/db/schema/chiefs';
import type { Customer, CustomerUpdate } from '$lib/models/customer.model';
import type { Request } from '$lib/models/customer.model';
import type { Service } from '$lib/models/service.model';
import type { CreateRequestDto } from '$lib/dtos/customer.dto';

export interface RequestWithChief {
	id_request: number;
	title_request: string;
	description_request: string;
	expected_date_request: string;
	guests_request: number;
	type_event_request: string | null;
	localization_request: string;
	statut_request: string;
	id_chief: string | null;
	chief_firstname: string | null;
	chief_name: string | null;
	chief_image: string | null;
	chief_specialty: string | null;
}

export interface RequestWithCustomer {
	id_request: number;
	title_request: string;
	description_request: string;
	expected_date_request: string;
	guests_request: number;
	type_event_request: string | null;
	localization_request: string;
	statut_request: string;
	id_customer: string;
	customer_firstname: string;
	customer_name: string;
	customer_image: string | null;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
	const result = await db.select().from(customers).where(eq(customers.id_customer, id)).limit(1);
	return result[0] ?? null;
}

export async function updateCustomer(id: string, data: CustomerUpdate): Promise<Customer> {
	const [updated] = await db
		.update(customers)
		.set(data)
		.where(eq(customers.id_customer, id))
		.returning();
	return updated;
}

export async function createRequest(customerId: string, data: CreateRequestDto): Promise<Request> {
	// Crée le profil client s'il n'existe pas encore (utilisateurs sans onboarding complet)
	await db
		.insert(customers)
		.values({ id_customer: customerId, preferences_customer: '' })
		.onConflictDoNothing();

	const [request] = await db
		.insert(requests)
		.values({ ...data, id_customer: customerId, statut_request: 'open' })
		.returning();
	return request;
}

export async function getRequestsByCustomer(customerId: string): Promise<Request[]> {
	return db.select().from(requests).where(eq(requests.id_customer, customerId));
}

export async function getServicesForChief(chiefId: string): Promise<Service[]> {
	return db.select().from(services).where(eq(services.id_chief, chiefId));
}

export async function getRequestsWithChiefDetails(customerId: string): Promise<RequestWithChief[]> {
	const rows = await db
		.select({
			id_request: requests.id_request,
			title_request: requests.title_request,
			description_request: requests.description_request,
			expected_date_request: requests.expected_date_request,
			guests_request: requests.guests_request,
			type_event_request: requests.type_event_request,
			localization_request: requests.localization_request,
			statut_request: requests.statut_request,
			id_chief: requests.id_chief,
			chief_firstname: users.firstname,
			chief_name: users.name,
			chief_image: users.image,
			chief_specialty: specialties.name_speciality
		})
		.from(requests)
		.leftJoin(users, eq(requests.id_chief, users.id))
		.leftJoin(chiefs_specialties, eq(chiefs_specialties.id_chief, requests.id_chief))
		.leftJoin(specialties, eq(specialties.id_speciality, chiefs_specialties.id_speciality))
		.where(eq(requests.id_customer, customerId))
		.orderBy(requests.expected_date_request);

	// Deduplicate by id_request (M:N joins may produce duplicate rows)
	const seen = new Set<number>();
	return rows.filter((r) => {
		if (seen.has(r.id_request)) return false;
		seen.add(r.id_request);
		return true;
	});
}

export async function getRequestsByChief(): Promise<RequestWithCustomer[]> {
	return db
		.select({
			id_request: requests.id_request,
			title_request: requests.title_request,
			description_request: requests.description_request,
			expected_date_request: requests.expected_date_request,
			guests_request: requests.guests_request,
			type_event_request: requests.type_event_request,
			localization_request: requests.localization_request,
			statut_request: requests.statut_request,
			id_customer: requests.id_customer,
			customer_firstname: users.firstname,
			customer_name: users.name,
			customer_image: users.image
		})
		.from(requests)
		.innerJoin(customers, eq(requests.id_customer, customers.id_customer))
		.innerJoin(users, eq(customers.id_customer, users.id))
		.where(or(eq(requests.statut_request, 'open'), isNull(requests.id_chief)))
		.orderBy(requests.expected_date_request);
}
