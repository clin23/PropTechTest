export interface ApplicationRow {
  id: string;
  propertyId: string;
  applicant: string;
  property: string;
  status: string;
}

export interface Application extends ApplicationRow {}
