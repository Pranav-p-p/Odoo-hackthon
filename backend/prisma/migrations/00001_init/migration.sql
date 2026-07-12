-- ============================================================================
-- AssetFlow — Full Database Migration
-- Database: Supabase PostgreSQL
-- Generated for: Prisma + Supabase
--
-- This migration creates ALL tables, enums, indexes, constraints, triggers,
-- and functions required by the AssetFlow system.
-- ============================================================================

-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUM TYPES
-- ============================================================================

CREATE TYPE "Role" AS ENUM ('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "DepartmentStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED');
CREATE TYPE "AllocationStatus" AS ENUM ('ACTIVE', 'RETURNED', 'OVERDUE');
CREATE TYPE "TransferStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED');
CREATE TYPE "BookingStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');
CREATE TYPE "AuditStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');
CREATE TYPE "AuditItemStatus" AS ENUM ('PENDING', 'VERIFIED', 'MISSING', 'DAMAGED');

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ─────────────────────────────────────────────────
-- Users (Created first to satisfy Department FKs, altered later)
-- ─────────────────────────────────────────────────
CREATE TABLE "users" (
  "id"            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"         VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" TEXT         NOT NULL,
  "name"          VARCHAR(255) NOT NULL,
  "phone"         VARCHAR(50),
  "role"          "Role"       NOT NULL DEFAULT 'EMPLOYEE',
  "status"        "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "department_id" UUID, -- FK added later
  "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- Departments
-- ─────────────────────────────────────────────────
CREATE TABLE "departments" (
  "id"                   UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"                 VARCHAR(255)       NOT NULL UNIQUE,
  "head_id"              UUID               REFERENCES "users"("id") ON DELETE SET NULL,
  "parent_department_id" UUID               REFERENCES "departments"("id") ON DELETE SET NULL,
  "status"               "DepartmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at"           TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- Add department_id to users
ALTER TABLE "users" ADD CONSTRAINT "fk_users_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL;

CREATE INDEX "idx_users_department_id" ON "users"("department_id");
CREATE INDEX "idx_users_role"          ON "users"("role");

-- ─────────────────────────────────────────────────
-- Asset Categories
-- ─────────────────────────────────────────────────
CREATE TABLE "asset_categories" (
  "id"          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"        VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT,
  "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- Assets
-- ─────────────────────────────────────────────────
CREATE TABLE "assets" (
  "id"               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_tag"        VARCHAR(100)  NOT NULL UNIQUE,
  "serial_number"    VARCHAR(255),
  "name"             VARCHAR(255)  NOT NULL,
  "category_id"      UUID          NOT NULL REFERENCES "asset_categories"("id") ON DELETE RESTRICT,
  "department_id"    UUID          REFERENCES "departments"("id") ON DELETE SET NULL,
  "status"           "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
  "is_bookable"      BOOLEAN       NOT NULL DEFAULT FALSE,
  "acquisition_date" DATE,
  "acquisition_cost" DOUBLE PRECISION,
  "condition"        VARCHAR(100),
  "location"         VARCHAR(255),
  "photo_url"        VARCHAR(2048),
  "created_at"       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_assets_status"        ON "assets"("status");
CREATE INDEX "idx_assets_category_id"   ON "assets"("category_id");
CREATE INDEX "idx_assets_department_id" ON "assets"("department_id");

-- ─────────────────────────────────────────────────
-- Allocations
-- ─────────────────────────────────────────────────
CREATE TABLE "allocations" (
  "id"               UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_id"         UUID               NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
  "user_id"          UUID               NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status"           "AllocationStatus" NOT NULL DEFAULT 'ACTIVE',
  "allocated_at"     TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  "expected_return"  TIMESTAMPTZ,
  "returned_at"      TIMESTAMPTZ,
  "return_condition" VARCHAR(100),
  "return_notes"     TEXT
);

CREATE INDEX "idx_allocations_asset_id_status" ON "allocations"("asset_id", "status");

-- ─────────────────────────────────────────────────
-- Transfers
-- ─────────────────────────────────────────────────
CREATE TABLE "transfers" (
  "id"              UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_id"        UUID             NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
  "from_user_id"    UUID             REFERENCES "users"("id") ON DELETE SET NULL,
  "to_user_id"      UUID             REFERENCES "users"("id") ON DELETE SET NULL,
  "from_dept_id"    UUID             REFERENCES "departments"("id") ON DELETE SET NULL,
  "to_dept_id"      UUID             NOT NULL REFERENCES "departments"("id") ON DELETE RESTRICT,
  "requested_by_id" UUID             NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "approved_by_id"  UUID             REFERENCES "users"("id") ON DELETE SET NULL,
  "status"          "TransferStatus" NOT NULL DEFAULT 'REQUESTED',
  "reason"          TEXT,
  "created_at"      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  "updated_at"      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- Bookings
-- ─────────────────────────────────────────────────
CREATE TABLE "bookings" (
  "id"         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_id"   UUID            NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
  "user_id"    UUID            NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "start_time" TIMESTAMPTZ     NOT NULL,
  "end_time"   TIMESTAMPTZ     NOT NULL,
  "status"     "BookingStatus" NOT NULL DEFAULT 'UPCOMING',
  "purpose"    VARCHAR(255),
  "created_at" TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT "chk_booking_time_range" CHECK ("start_time" < "end_time")
);

CREATE INDEX "idx_bookings_asset_id_start_time" ON "bookings"("asset_id", "start_time");

-- ─────────────────────────────────────────────────
-- Maintenance Requests
-- ─────────────────────────────────────────────────
CREATE TABLE "maintenance_requests" (
  "id"                UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_id"          UUID                  NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
  "requested_by_id"   UUID                  NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "issue_description" TEXT                  NOT NULL,
  "priority"          "MaintenancePriority" NOT NULL DEFAULT 'MEDIUM',
  "status"            "MaintenanceStatus"   NOT NULL DEFAULT 'PENDING_APPROVAL',
  "technician_id"     UUID                  REFERENCES "users"("id") ON DELETE SET NULL,
  "photo_url"         VARCHAR(2048),
  "resolved_notes"    TEXT,
  "created_at"        TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  "updated_at"        TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_maintenance_requests_asset_id_status" ON "maintenance_requests"("asset_id", "status");

-- ─────────────────────────────────────────────────
-- Audit Cycles
-- ─────────────────────────────────────────────────
CREATE TABLE "audit_cycles" (
  "id"             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"           VARCHAR(255)  NOT NULL,
  "department_id"  UUID          REFERENCES "departments"("id") ON DELETE SET NULL,
  "location_scope" VARCHAR(255),
  "auditor_id"     UUID          NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status"         "AuditStatus" NOT NULL DEFAULT 'OPEN',
  "start_date"     TIMESTAMPTZ   NOT NULL,
  "end_date"       TIMESTAMPTZ   NOT NULL,
  "created_at"     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "closed_at"      TIMESTAMPTZ
);

-- ─────────────────────────────────────────────────
-- Audit Items
-- ─────────────────────────────────────────────────
CREATE TABLE "audit_items" (
  "id"                UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  "audit_cycle_id"    UUID              NOT NULL REFERENCES "audit_cycles"("id") ON DELETE CASCADE,
  "asset_id"          UUID              NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
  "expected_location" VARCHAR(255),
  "expected_status"   "AssetStatus"     NOT NULL,
  "actual_status"     "AuditItemStatus" NOT NULL DEFAULT 'PENDING',
  "notes"             TEXT
);

-- ─────────────────────────────────────────────────
-- Notifications
-- ─────────────────────────────────────────────────
CREATE TABLE "notifications" (
  "id"         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID         NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title"      VARCHAR(255) NOT NULL,
  "message"    TEXT         NOT NULL,
  "type"       VARCHAR(50)  NOT NULL,
  "category"   VARCHAR(50)  NOT NULL,
  "is_read"    BOOLEAN      NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_notifications_user_read" ON "notifications"("user_id", "is_read");

-- ─────────────────────────────────────────────────
-- Activity Logs
-- ─────────────────────────────────────────────────
CREATE TABLE "activity_logs" (
  "id"          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"     UUID         REFERENCES "users"("id") ON DELETE SET NULL,
  "action"      VARCHAR(100) NOT NULL,
  "entity_type" VARCHAR(100) NOT NULL,
  "entity_id"   VARCHAR(255) NOT NULL,
  "details"     JSONB,
  "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_activity_logs_created" ON "activity_logs"("created_at" DESC);


-- ============================================================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transfers_updated_at
  BEFORE UPDATE ON "transfers"
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_maintenance_requests_updated_at
  BEFORE UPDATE ON "maintenance_requests"
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Prevent double allocation
CREATE OR REPLACE FUNCTION fn_prevent_double_allocation()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_status "AssetStatus";
  v_active_count INTEGER;
BEGIN
  SELECT status INTO v_asset_status FROM "assets" WHERE id = NEW.asset_id;
  IF v_asset_status != 'AVAILABLE' THEN
    RAISE EXCEPTION 'Cannot allocate asset: current status is %, expected AVAILABLE', v_asset_status;
  END IF;

  SELECT COUNT(*) INTO v_active_count FROM "allocations"
  WHERE asset_id = NEW.asset_id AND status = 'ACTIVE';

  IF v_active_count > 0 THEN
    RAISE EXCEPTION 'Cannot allocate asset: it already has an active allocation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_double_allocation
  BEFORE INSERT ON "allocations"
  FOR EACH ROW EXECUTE FUNCTION fn_prevent_double_allocation();

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE "departments"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asset_categories"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assets"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "allocations"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transfers"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookings"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "maintenance_requests"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_cycles"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_items"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity_logs"         ENABLE ROW LEVEL SECURITY;
