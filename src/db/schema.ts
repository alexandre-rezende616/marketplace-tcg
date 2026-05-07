import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  password: text('password').notNull(),
  role: text('role').notNull(),
  avatarUrl: text('avatar_url'),
  nickname: text('nickname'), // A nova coluna de apelido (Nome de Aventureiro)
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
});

export const relics = sqliteTable('relics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  price: real('price').notNull(),
  imageUrl: text('image_url'),
  userId: integer('user_id').references(() => users.id),
  categoryId: integer('category_id').references(() => categories.id),
  conditionId: integer('condition_id').references(() => categories.id),
  rarityId: integer('rarity_id').references(() => categories.id),
  languageId: integer('language_id').references(() => categories.id),
  inStock: integer('in_stock', { mode: 'boolean' }).default(true),
});

export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  relicId: integer('relic_id').references(() => relics.id).notNull(),
});
