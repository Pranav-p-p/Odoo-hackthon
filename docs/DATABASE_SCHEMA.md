# Database Schema

This document defines the canonical Prisma schema representing the Supabase PostgreSQL database structure. All enum values, field names, and table names are frozen and must match `SHARED_ENUMS.md` and `API_CONTRACT.md` exactly.

---

## Core Enums

```prisma
enum Role {
  ADMIN
  ASSET_MANAGER
  DEPARTMENT_HEAD
  EMPLOYEE
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

enum DepartmentStatus {
  ACTIVE
  INACTIVE
}

enum AssetStatus {
  AVAILABLE
  ALLOCATED
  RESERVED
  UNDER_MAINTENANCE
  LOST
  RETIRED
  DISPOSED
}

enum AllocationStatus {
  ACTIVE
  RETURNED
  OVERDUE
}

enum TransferStatus {
  REQUESTED
  APPROVED
  REJECTED
  COMPLETED
}

enum BookingStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}

enum MaintenancePriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum MaintenanceStatus {
  PENDING_APPROVAL
  APPROVED
  TECHNICIAN_ASSIGNED
  IN_PROGRESS
  RESOLVED
  REJECTED
}

enum AuditStatus {
  OPEN
  IN_PROGRESS
  CLOSED
}

enum AuditItemStatus {
  PENDING
  VERIFIED
  MISSING
  DAMAGED
}
```

---

## Tables

### Users and Organization

```prisma
model Department {
  id               String           @id @default(uuid())
  name             String           @unique
  headId           String?
  head             User?            @relation("DepartmentHead", fields: [headId], references: [id])
  parentDepartmentId String?
  parentDepartment Department?      @relation("DepartmentHierarchy", fields: [parentDepartmentId], references: [id])
  childDepartments Department[]     @relation("DepartmentHierarchy")
  status           DepartmentStatus @default(ACTIVE)
  createdAt        DateTime         @default(now())

  users            User[]           @relation("UserDepartment")
  assets           Asset[]
}

model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  name         String
  phone        String?
  role         Role       @default(EMPLOYEE)
  status       UserStatus @default(ACTIVE)
  departmentId String?
  department   Department? @relation("UserDepartment", fields: [departmentId], references: [id])
  createdAt    DateTime   @default(now())

  // Relations
  allocations           Allocation[]
  bookings              Booking[]
  headOfDepartments     Department[]           @relation("DepartmentHead")
  transfersRequested    Transfer[]             @relation("TransferRequester")
  maintenanceRequests   MaintenanceRequest[]   @relation("MaintenanceRequester")
  technicianAssignments MaintenanceRequest[]   @relation("MaintenanceTechnician")
  auditAssignments      AuditCycle[]           @relation("AuditAuditor")
  notifications         Notification[]
}
```

### Asset Categories and Assets

```prisma
model AssetCategory {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())

  assets      Asset[]
}

model Asset {
  id              String        @id @default(uuid())
  assetTag        String        @unique   // Format: AF-0001
  serialNumber    String?
  name            String
  categoryId      String
  category        AssetCategory @relation(fields: [categoryId], references: [id])
  departmentId    String?
  department      Department?   @relation(fields: [departmentId], references: [id])
  status          AssetStatus   @default(AVAILABLE)
  isBookable      Boolean       @default(false)
  acquisitionDate DateTime?
  acquisitionCost Float?
  condition       String?       // e.g. "Good", "Fair", "Poor"
  location        String?       // e.g. "Bengaluru", "HQ Floor 2", "Warehouse"
  photoUrl        String?
  createdAt       DateTime      @default(now())

  allocations     Allocation[]
  transfers       Transfer[]
  bookings        Booking[]
  maintenanceReqs MaintenanceRequest[]
  auditItems      AuditItem[]
}
```

### Transactions (Allocations & Transfers)

```prisma
model Allocation {
  id              String           @id @default(uuid())
  assetId         String
  asset           Asset            @relation(fields: [assetId], references: [id])
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  status          AllocationStatus @default(ACTIVE)
  allocatedAt     DateTime         @default(now())
  expectedReturn  DateTime?
  returnedAt      DateTime?
  returnCondition String?          // Condition at check-in: "Good", "Fair", "Damaged"
  returnNotes     String?          // Free-text check-in notes
}

model Transfer {
  id             String         @id @default(uuid())
  assetId        String
  asset          Asset          @relation(fields: [assetId], references: [id])
  fromUserId     String?
  fromUser       User?          @relation("TransferFrom", fields: [fromUserId], references: [id])
  toUserId       String?
  toUser         User?          @relation("TransferTo", fields: [toUserId], references: [id])
  fromDeptId     String?
  toDeptId       String
  requestedById  String
  requestedBy    User           @relation("TransferRequester", fields: [requestedById], references: [id])
  approvedById   String?
  status         TransferStatus @default(REQUESTED)
  reason         String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}
```

### Operations (Bookings & Maintenance)

```prisma
model Booking {
  id        String        @id @default(uuid())
  assetId   String
  asset     Asset         @relation(fields: [assetId], references: [id])
  userId    String
  user      User          @relation(fields: [userId], references: [id])
  startTime DateTime
  endTime   DateTime
  status    BookingStatus @default(UPCOMING)
  purpose   String?
  createdAt DateTime      @default(now())
}

model MaintenanceRequest {
  id               String              @id @default(uuid())
  assetId          String
  asset            Asset               @relation(fields: [assetId], references: [id])
  requestedById    String
  requestedBy      User                @relation("MaintenanceRequester", fields: [requestedById], references: [id])
  issueDescription String
  priority         MaintenancePriority @default(MEDIUM)
  status           MaintenanceStatus   @default(PENDING_APPROVAL)
  technicianId     String?
  technician       User?               @relation("MaintenanceTechnician", fields: [technicianId], references: [id])
  photoUrl         String?
  resolvedNotes    String?
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt
}
```

### Intelligence (Audit, Notifications, Logs)

```prisma
model AuditCycle {
  id             String      @id @default(uuid())
  name           String
  departmentId   String?
  locationScope  String?     // e.g. "HQ Floor 2", "Warehouse"
  auditorId      String
  auditor        User        @relation("AuditAuditor", fields: [auditorId], references: [id])
  status         AuditStatus @default(OPEN)
  startDate      DateTime
  endDate        DateTime
  createdAt      DateTime    @default(now())
  closedAt       DateTime?

  items          AuditItem[]
}

model AuditItem {
  id             String           @id @default(uuid())
  auditCycleId   String
  auditCycle     AuditCycle       @relation(fields: [auditCycleId], references: [id])
  assetId        String
  asset          Asset            @relation(fields: [assetId], references: [id])
  expectedLocation String?
  expectedStatus AssetStatus
  actualStatus   AuditItemStatus  @default(PENDING)
  notes          String?
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  message   String
  type      String   // Values from NotificationType in SHARED_ENUMS.md
  category  String   // Values: ALERTS, APPROVALS, BOOKINGS
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model ActivityLog {
  id          String   @id @default(uuid())
  userId      String?
  action      String   // e.g. "ASSET_REGISTERED", "ALLOCATION_CREATED"
  entityType  String   // e.g. "Asset", "Allocation", "Transfer"
  entityId    String
  details     Json?
  createdAt   DateTime @default(now())
}
```

---

## Key Relationships Summary

```text
Department ←──(headId)──→ User (1:1 optional)
Department ←──(parentDepartmentId)──→ Department (self-ref hierarchy)
User ──→ Department (many:1)
Asset ──→ AssetCategory (many:1)
Asset ──→ Department (many:1 optional)
Allocation ──→ Asset + User (many:1 each)
Transfer ──→ Asset + User(requester) + User(from) + User(to) (many:1 each)
Booking ──→ Asset + User (many:1 each)
MaintenanceRequest ──→ Asset + User(requester) + User(technician) (many:1 each)
AuditCycle ──→ User(auditor) (many:1)
AuditItem ──→ AuditCycle + Asset (many:1 each)
Notification ──→ User (many:1)
```

---

## Indexes (Performance)

```prisma
@@index([assetId, status])    // on Allocation — fast "is this asset allocated?" check
@@index([assetId, startTime]) // on Booking — fast overlap validation
@@index([userId, isRead])     // on Notification — fast unread count
@@index([assetId, status])    // on MaintenanceRequest — fast "is this asset under maintenance?"
@@index([createdAt])          // on ActivityLog — fast reverse-chronological queries
```
