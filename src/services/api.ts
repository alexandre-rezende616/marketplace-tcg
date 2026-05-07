import { eq, and, like } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { db } from '../db/db';
import { users, relics, categories, favorites } from '../db/schema';

export const api = {
  loginUser: async (email: string, pass: string) => {
    const result = await db.select().from(users).where(eq(users.email, email));
    if (result.length > 0 && result[0].password === pass) {
      return result[0];
    }
    throw new Error('Credenciais da guilda inválidas!');
  },

  registerUser: async (email: string, pass: string, nickname: string) => {
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) throw new Error('Este e-mail já pertence a outro aventureiro!');
    await db.insert(users).values({ email, password: pass, role: 'user', nickname });
  },

  fetchRelics: async (
    categoryId: number | null = null, 
    searchQuery: string = '',
    conditionId: number | null = null,
    rarityId: number | null = null,
    languageId: number | null = null
  ) => {
    const filters = [];
    
    if (categoryId) {
      filters.push(eq(relics.categoryId, categoryId));
    }
    if (conditionId) {
      filters.push(eq(relics.conditionId, conditionId));
    }
    if (rarityId) {
      filters.push(eq(relics.rarityId, rarityId));
    }
    if (languageId) {
      filters.push(eq(relics.languageId, languageId));
    }
    
    if (searchQuery.trim() !== '') {
      filters.push(like(relics.title, `%${searchQuery}%`));
    }

    if (filters.length > 0) {
      return await db.select().from(relics).where(and(...filters));
    }
    
    return await db.select().from(relics);
  },

  fetchUserRelics: async (userId: number) => {
    return await db.select().from(relics).where(eq(relics.userId, userId));
  },

  fetchCategories: async () => {
    return await db.select().from(categories);
  },

  addCategory: async (name: string, type: string) => {
    await db.insert(categories).values({ name, type });
  },

  deleteCategory: async (categoryId: number) => {
    await db.delete(categories).where(eq(categories.id, categoryId));
  },

  addRelic: async (
    title: string, 
    price: number, 
    categoryId: number, 
    conditionId: number, 
    rarityId: number, 
    languageId: number, 
    userId: number, 
    imageUrl: string
  ) => {
    await db.insert(relics).values({ 
      title, 
      price, 
      categoryId, 
      conditionId,
      rarityId,
      languageId,
      userId, 
      imageUrl, 
      inStock: true 
    });
  },

  updateUserAvatar: async (userId: number, avatarUrl: string) => {
    await db.update(users).set({ avatarUrl }).where(eq(users.id, userId));
  },

  deleteRelic: async (relicId: number, userId: number) => {
    await db.delete(relics).where(and(eq(relics.id, relicId), eq(relics.userId, userId)));
  },

  buyRelic: async (relicId: number) => {
    await db.update(relics).set({ inStock: false }).where(eq(relics.id, relicId));
  },

  fetchRelicDetails: async (relicId: number) => {
    const game = alias(categories, 'game');
    const condition = alias(categories, 'condition');
    const rarity = alias(categories, 'rarity');
    const language = alias(categories, 'language');

    const result = await db.select({
      // CORREÇÃO: Selecionando cada campo explicitamente
      id: relics.id,
      title: relics.title,
      price: relics.price,
      imageUrl: relics.imageUrl,
      userId: relics.userId,
      inStock: relics.inStock,
      // E pegando o campo 'name' de cada categoria associada
      gameName: game.name,
      conditionName: condition.name,
      rarityName: rarity.name,
      languageName: language.name,
    })
    .from(relics)
    .where(eq(relics.id, relicId))
    .leftJoin(game, eq(relics.categoryId, game.id))
    .leftJoin(condition, eq(relics.conditionId, condition.id))
    .leftJoin(rarity, eq(relics.rarityId, rarity.id))
    .leftJoin(language, eq(relics.languageId, language.id));
    
    return result[0];
  },

  checkIsFavorite: async (userId: number, relicId: number) => {
    const result = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.relicId, relicId)));
    return result.length > 0;
  },

  toggleFavorite: async (userId: number, relicId: number) => {
    const isFav = await api.checkIsFavorite(userId, relicId);
    if (isFav) {
      await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.relicId, relicId)));
      return false; // Removeu
    } else {
      await db.insert(favorites).values({ userId, relicId });
      return true; // Adicionou
    }
  },

  fetchUserFavorites: async (userId: number) => {
    const result = await db.select({
      id: relics.id,
      title: relics.title,
      price: relics.price,
      imageUrl: relics.imageUrl,
      inStock: relics.inStock
    })
    .from(favorites)
    .innerJoin(relics, eq(favorites.relicId, relics.id))
    .where(eq(favorites.userId, userId));
    return result;
  },

  getAdminStats: async () => {
    const allRelics = await db.select().from(relics);
    const totalRelics = allRelics.length;
    const soldRelics = allRelics.filter(r => !r.inStock);
    const totalSold = soldRelics.length;
    const totalValue = soldRelics.reduce((acc, r) => acc + r.price, 0);
    
    return { totalRelics, totalSold, totalValue };
  },

  updateUserProfile: async (userId: number, nickname: string, pass: string) => {
    const dataToUpdate: any = {};
    if (nickname) dataToUpdate.nickname = nickname;
    if (pass) dataToUpdate.password = pass;
    
    if (Object.keys(dataToUpdate).length > 0) {
      await db.update(users).set(dataToUpdate).where(eq(users.id, userId));
    }
  }
};
