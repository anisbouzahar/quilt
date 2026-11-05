import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Initial infrastructure only; financial and membership models are still open.
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
