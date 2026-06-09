export interface Request {
    id_request: number;
    description_request: string;
    expected_date_request: string;
    guests_request: number;
    type_event_request: string | null;
    localization_request: string;
    statut_request: string;
    id_service: number | null;
    id_customer: string;
    id_chief: string;
}

export type CreateRequest = Omit<Request, 'id_request' | 'id_service'>;


export interface Customer {
    id_customer: string;
    preferences_customer: string;
}

export type CustomerUpdate = Partial<Pick<Customer, 'preferences_customer'>>;
