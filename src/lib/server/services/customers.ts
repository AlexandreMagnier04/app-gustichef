import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema/customers';
import type { Customer, CustomerUpdate } from '$lib/models/customer.model';

import { requests } from '$lib/server/db/schema/customers';
import { services } from '$lib/server/db/schema/services';
import type { Request } from '$lib/models/customer.model';
import type { Service } from '$lib/dtos/service.model';
import type { CreateRequestDto } from '$lib/dtos/customer.dto';

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
