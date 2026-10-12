import { pgTable, uuid, varchar, boolean, timestamp, text, numeric, pgEnum, date, integer, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['superadmin', 'owner', 'receptionist']);
export const staffRoleEnum = pgEnum('staff_role', ['OWNER', 'MANAGER', 'CASHIER']);
export const membershipStatusEnum = pgEnum('membership_status', ['active', 'expired', 'frozen', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'transfer']);
export const paymentStatusEnum = pgEnum('payment_status', ['paid', 'voided']);
export const checkinMethodEnum = pgEnum('checkin_method', ['qr_scan', 'manual_doc']);

// 1. Organizaciones (Empresas / Dueños)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Gimnasios (compatibilidad retroactiva con v1)
export const gyms = pgTable('gyms', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  taxId: varchar('tax_id', { length: 50 }),
  phone: varchar('phone', { length: 30 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 2. Sedes (Branches)
export const branches = pgTable('branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 30 }),
  status: varchar('status', { length: 50 }).default('active'),
  defaultSessionHours: numeric('default_session_hours', { precision: 3, scale: 1 }).default('2.0'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 3. Usuarios / Staff
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }), // nullable para dueño, obligatorio para cajeros/staff
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  role: staffRoleEnum('role').notNull().default('CASHIER'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const appUsers = pgTable('app_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  role: userRoleEnum('role').notNull().default('receptionist'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const coaches = pgTable('coaches', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  documentId: varchar('document_id', { length: 50 }),
  phone: varchar('phone', { length: 30 }),
  specialty: varchar('specialty', { length: 100 }),
  scheduleDetails: text('schedule_details'),
  isActive: boolean('is_active').default(true),
  isClockedIn: boolean('is_clocked_in').default(false).notNull(),
  lastClockIn: timestamp('last_clock_in', { withTimezone: true }),
  lastClockOut: timestamp('last_clock_out', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 4. Tablas Operativas con aislamiento por branch_id

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  documentId: varchar('document_id', { length: 50 }).notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 255 }),
  photoUrl: text('photo_url'),
  qrAccessToken: varchar('qr_access_token', { length: 64 }).unique().notNull(),
  coachId: uuid('coach_id').references(() => coaches.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  gymIdDocUnique: uniqueIndex('gym_id_doc_idx').on(table.gymId, table.documentId),
  branchIdx: index('idx_members_branch').on(table.branchId),
}));

export const membershipPlans = pgTable('membership_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 100 }).notNull(),
  durationDays: integer('duration_days').notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
});

export const memberSubscriptions = pgTable('member_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').notNull().references(() => membershipPlans.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: membershipStatusEnum('status').default('active'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  activeSubIdx: index('idx_member_subscriptions_active').on(table.memberId, table.status, table.endDate),
  branchSubIdx: index('idx_member_subscriptions_branch').on(table.branchId),
}));

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id),
  memberId: uuid('member_id').references(() => members.id),
  subscriptionId: uuid('subscription_id').references(() => memberSubscriptions.id),
  concept: varchar('concept', { length: 50 }).default('membership'),
  coachId: uuid('coach_id').references(() => coaches.id, { onDelete: 'set null' }),
  registeredByUserId: uuid('registered_by_user_id').references(() => appUsers.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  method: paymentMethodEnum('method').notNull(),
  referenceNumber: varchar('reference_number', { length: 100 }),
  receiptUrl: text('receipt_url'),
  status: paymentStatusEnum('status').default('paid'),
  voidReason: text('void_reason'),
  voidedBy: uuid('voided_by').references(() => appUsers.id),
  voidedAt: timestamp('voided_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  branchPaymentIdx: index('idx_payments_branch').on(table.branchId),
}));

export const expenseCategories = pgTable('expense_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 100 }).notNull(),
});

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id),
  categoryId: uuid('category_id').references(() => expenseCategories.id),
  registeredByUserId: uuid('registered_by_user_id').references(() => appUsers.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description').notNull(),
  expenseDate: date('expense_date').defaultNow().notNull(),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  branchExpenseIdx: index('idx_expenses_branch').on(table.branchId),
}));

export const cashShifts = pgTable('cash_shifts', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id),
  userId: uuid('user_id').notNull().references(() => appUsers.id),
  openingTime: timestamp('opening_time', { withTimezone: true }).notNull().defaultNow(),
  closingTime: timestamp('closing_time', { withTimezone: true }),
  initialCash: numeric('initial_cash', { precision: 12, scale: 2 }).default('0.00'),
  finalCashExpected: numeric('final_cash_expected', { precision: 12, scale: 2 }),
  finalCashCounted: numeric('final_cash_counted', { precision: 12, scale: 2 }),
  difference: numeric('difference', { precision: 12, scale: 2 }),
  isClosed: boolean('is_closed').default(false),
}, (table) => ({
  branchShiftIdx: index('idx_cash_shifts_branch').on(table.branchId),
}));

export const attendances = pgTable('attendances', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  checkIn: timestamp('check_in', { withTimezone: true }).notNull().defaultNow(),
  checkOut: timestamp('check_out', { withTimezone: true }),
  method: checkinMethodEnum('method').default('qr_scan'),
}, (table) => ({
  aforoIdx: index('idx_attendances_aforo').on(table.branchId, table.checkIn),
}));

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  gymId: uuid('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 150 }).notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 5. Transacciones Generales (Aislamiento Multi-Sede)
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'income' | 'expense'
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  paymentMethod: paymentMethodEnum('payment_method').default('cash'),
  referenceNumber: varchar('reference_number', { length: 100 }),
  status: varchar('status', { length: 50 }).default('completed'),
  registeredByUserId: uuid('registered_by_user_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  branchTxIdx: index('idx_transactions_branch').on(table.branchId),
}));

// Exportación de tipos inferidos
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AppUser = typeof appUsers.$inferSelect;
export type NewAppUser = typeof appUsers.$inferInsert;
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Attendance = typeof attendances.$inferSelect;
export type NewAttendance = typeof attendances.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type CashShift = typeof cashShifts.$inferSelect;
export type NewCashShift = typeof cashShifts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
