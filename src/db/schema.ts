import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  password: text('password').notNull(),
  role: text('role').notNull(),
  avatarUrl: text('avatar_url'),
  nickname: text('nickname'),
});

// Nova Tabela Matriz
export const tcgGroups = sqliteTable('tcg_groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  // Efeito Cascata: Se o TCG sumir, a raridade vai junto!
  tcgId: integer('tcg_id').references(() => tcgGroups.id, { onDelete: 'cascade' }),
});

export const relics = sqliteTable('relics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  price: real('price').notNull(),
  imageUrl: text('image_url'),
  userId: integer('user_id').references(() => users.id),
  tcgId: integer('tcg_id').references(() => tcgGroups.id), // Carta vinculada à Matriz
  conditionId: integer('condition_id').references(() => categories.id),
  rarityId: integer('rarity_id').references(() => categories.id),
  finishId: integer('finish_id').references(() => categories.id), // Acabamento (Foil/Tratamento)
  languageId: integer('language_id').references(() => categories.id),
  inStock: integer('in_stock', { mode: 'boolean' }).default(true),
});

export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  relicId: integer('relic_id').references(() => relics.id).notNull(),
});
