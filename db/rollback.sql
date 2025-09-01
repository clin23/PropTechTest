-- Rollback script to drop all objects
DROP TABLE IF EXISTS user_notification_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS compliance_items CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS maintenance_quotes CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS maintenance_jobs CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS tenancies CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types
DROP TYPE IF EXISTS notification_status;
DROP TYPE IF EXISTS notification_channel;
DROP TYPE IF EXISTS compliance_status;
DROP TYPE IF EXISTS compliance_type;
DROP TYPE IF EXISTS document_owner_type;
DROP TYPE IF EXISTS message_channel;
DROP TYPE IF EXISTS message_thread_type;
DROP TYPE IF EXISTS quote_status;
DROP TYPE IF EXISTS job_status;
DROP TYPE IF EXISTS job_priority;
DROP TYPE IF EXISTS ledger_entry_type;
DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS rent_frequency;
DROP TYPE IF EXISTS tenancy_status;
DROP TYPE IF EXISTS scope_type;
DROP TYPE IF EXISTS role_code;

