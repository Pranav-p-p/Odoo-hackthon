# Database Schema

This document defines the canonical Prisma schema representing the Supabase PostgreSQL database structure.

## Core Enums

```prisma
enum Role {
  ADMIN
  ASSET_MANAGER
  DEPARTMENT_HEAD
  EMPLOYEE
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

enum MaintenanceStatus {
  PENDING_APPROVAL
  APPROVED
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
  VERIFIED
  MISSING
  DAMAGED
}
```

## Tables

### Users and Organization
```prisma
model Department {
  id        String   @id @default(uuid())
  name      String   @unique
  createdAt DateTime @default(now())
  
  users     User[]
  assets    Asset[]
}

model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  name         String
  role         Role       @default(EMPLOYEE)
  departmentId String?
  department   Department? @relation(fields: [departmentId], references: [id])
  createdAt    DateTime   @default(now())
  
  allocations  Allocation[]
  bookings     Booking[]
}
```

### Assets
```prisma
model AssetCategory {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  assets      Asset[]
}

model Asset {
  id              String        @id @default(uuid())
  assetTag        String        @unique
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
  condition       String?
  createdAt       DateTime      @default(now())

  allocations     Allocation[]
  transfers       Transfer[]
  bookings        Booking[]
  maintenanceReqs MaintenanceRequest[]
}
```

### Transactions (Allocations & Transfers)
```prisma
model Allocation {
  id           String    @id @default(uuid())
  assetId      String
  asset        Asset     @relation(fields: [assetId], references: [id])
  userId       String
  user         User      @relation(fields: [userId], references: [id])
  allocatedAt  DateTime  @default(now())
  returnedAt   DateTime?
  expectedReturn DateTime?
}

model Transfer {
  id             String         @id @default(uuid())
  assetId        String
  asset          Asset          @relation(fields: [assetId], references: [id])
  fromDeptId     String?
  toDeptId       String
  requestedById  String
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
  createdAt DateTime      @default(now())
}

model MaintenanceRequest {
  id               String            @id @default(uuid())
  assetId          String
  asset            Asset             @relation(fields: [assetId], references: [id])
  requestedById    String
  issueDescription String
  status           MaintenanceStatus @default(PENDING_APPROVAL)
  resolvedNotes    String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
}
```

### Intelligence (Audit, Notifications, Logs)
```prisma
model AuditCycle {
  id           String      @id @default(uuid())
  name         String
  departmentId String?
  auditorId    String
  status       AuditStatus @default(OPEN)
  createdAt    DateTime    @default(now())
  closedAt     DateTime?
  
  items        AuditItem[]
}

model AuditItem {
  id           String          @id @default(uuid())
  auditCycleId String
  auditCycle   AuditCycle      @relation(fields: [auditCycleId], references: [id])
  assetId      String
  expectedStatus AssetStatus
  actualStatus AuditItemStatus?
  notes        String?
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  message   String
  type      String   // Using string here to allow flexibility in frontend display
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model ActivityLog {
  id          String   @id @default(uuid())
  userId      String?
  action      String
  entityType  String
  entityId    String
  details     Json?
  createdAt   DateTime @default(now())
}
```
