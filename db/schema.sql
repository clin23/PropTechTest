CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE role_code AS ENUM ('OWNER', 'CO_OWNER', 'ACCOUNTANT', 'TENANT', 'TRADIE');
CREATE TYPE scope_type AS ENUM ('GLOBAL', 'PROPERTY', 'TENANCY', 'JOB');
CREATE TYPE tenancy_status AS ENUM ('ACTIVE', 'ENDED');
CREATE TYPE rent_frequency AS ENUM ('WEEKLY', 'FORTNIGHTLY', 'MONTHLY');
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CARD', 'CASH');
CREATE TYPE ledger_entry_type AS ENUM ('RENT', 'ARREARS', 'ADJUSTMENT', 'FEE');
CREATE TYPE job_priority AS ENUM ('LOW', 'NORMAL', 'URGENT');
CREATE TYPE job_status AS ENUM ('SUBMITTED', 'APPROVED', 'IN_PROGRESS', 'DONE');
CREATE TYPE quote_status AS ENUM ('REQUESTED', 'RECEIVED', 'APPROVED', 'REJECTED');
CREATE TYPE message_thread_type AS ENUM ('TENANCY', 'JOB');
CREATE TYPE message_channel AS ENUM ('IN_APP', 'EMAIL', 'SMS');
CREATE TYPE document_owner_type AS ENUM ('PROPERTY', 'TENANCY', 'LEASE', 'JOB');
CREATE TYPE compliance_type AS ENUM ('SMOKE_ALARM', 'ROUTINE_INSPECTION', 'INSURANCE_RENEWAL', 'POOL_CERT');
CREATE TYPE compliance_status AS ENUM ('DUE', 'OK', 'OVERDUE');
CREATE TYPE notification_channel AS ENUM ('IN_APP', 'EMAIL', 'PUSH');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'READ');

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    auth_provider TEXT,
    status TEXT
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code role_code NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope_type scope_type NOT NULL,
    scope_id UUID,
    UNIQUE(user_id, role_id, scope_type, scope_id)
);

-- Core Property Objects
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_line1 TEXT,
    suburb TEXT,
    state TEXT,
    postcode TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    parking INTEGER,
    notes TEXT
);

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    emergency_contact TEXT,
    bank_ref TEXT
);

CREATE TABLE tenancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    primary_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    rent_amount NUMERIC(12,2) NOT NULL,
    rent_frequency rent_frequency NOT NULL,
    bond_amount NUMERIC(12,2),
    payment_day_of_week INTEGER,
    status tenancy_status NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenancy_id UUID NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    terms_url TEXT,
    bond_lodged BOOLEAN DEFAULT FALSE,
    bond_number TEXT,
    rent_review_date DATE
);

-- Money & Ledger
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenancy_id UUID NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
    date_received DATE NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    method payment_method NOT NULL,
    reference TEXT,
    external_txn_id TEXT,
    notes TEXT
);

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenancy_id UUID NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    type ledger_entry_type NOT NULL,
    amount_debit NUMERIC(12,2) DEFAULT 0,
    amount_credit NUMERIC(12,2) DEFAULT 0,
    balance_after NUMERIC(12,2) NOT NULL,
    linked_payment_id UUID REFERENCES payments(id)
);

-- Maintenance & Comms
CREATE TABLE maintenance_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenancy_id UUID REFERENCES tenancies(id) ON DELETE SET NULL,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    priority job_priority NOT NULL DEFAULT 'NORMAL',
    status job_status NOT NULL DEFAULT 'SUBMITTED',
    spend_cap NUMERIC(12,2),
    due_date DATE
);

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    abn TEXT,
    license_no TEXT,
    insurance_expiry DATE
);

CREATE TABLE maintenance_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES maintenance_jobs(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    notes TEXT,
    status quote_status NOT NULL DEFAULT 'REQUESTED'
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_type message_thread_type NOT NULL,
    thread_id UUID NOT NULL,
    sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    channel message_channel NOT NULL,
    has_attachments BOOLEAN DEFAULT FALSE
);

-- Documents & Compliance
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type document_owner_type NOT NULL,
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE compliance_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    type compliance_type NOT NULL,
    due_date DATE NOT NULL,
    status compliance_status NOT NULL DEFAULT 'DUE',
    document_id UUID REFERENCES documents(id)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload_json JSONB,
    channel notification_channel NOT NULL,
    status notification_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE user_notification_settings (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    email BOOLEAN DEFAULT TRUE,
    push BOOLEAN DEFAULT TRUE,
    sms BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    PRIMARY KEY (user_id, type)
);

-- Indexes
CREATE INDEX idx_payments_tenancy ON payments(tenancy_id, date_received);
CREATE INDEX idx_ledger_entries_tenancy ON ledger_entries(tenancy_id, entry_date);
CREATE INDEX idx_jobs_property ON maintenance_jobs(property_id);
CREATE INDEX idx_messages_thread ON messages(thread_type, thread_id);
CREATE INDEX idx_documents_owner ON documents(owner_type, owner_id);
CREATE INDEX idx_compliance_property ON compliance_items(property_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, status);

