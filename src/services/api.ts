import { eq, and, like } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { db } from '../db/db';
import { users, relics, categories, favorites, tcgGroups } from '../db/schema';

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
    tcgId: number | null = null, 
    searchQuery: string = '',
    conditionId: number | null = null,
    rarityId: number | null = null,
    finishId: number | null = null,
    languageId: number | null = null
  ) => {
    const filters = [];
    
    if (tcgId) {
      filters.push(eq(relics.tcgId, tcgId));
    }
    if (conditionId) {
      filters.push(eq(relics.conditionId, conditionId));
    }
    if (rarityId) {
      filters.push(eq(relics.rarityId, rarityId));
    }
    if (finishId) {
      filters.push(eq(relics.finishId, finishId));
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

  fetchTcgGroups: async () => {
    return await db.select().from(tcgGroups);
  },

  addTcgGroup: async (name: string) => {
    await db.insert(tcgGroups).values({ name });
  },

  addCategory: async (name: string, type: string, tcgId: number | null = null) => {
    await db.insert(categories).values({ name, type, tcgId });
  },

  deleteCategory: async (categoryId: number) => {
    await db.delete(categories).where(eq(categories.id, categoryId));
  },

  addRelic: async (
    title: string, 
    price: number, 
    tcgId: number, 
    conditionId: number, 
    rarityId: number | null, 
    finishId: number | null,
    languageId: number, 
    userId: number, 
    imageUrl: string
  ) => {
    await db.insert(relics).values({ 
      title, 
      price, 
      tcgId, 
      conditionId,
      rarityId,
      finishId,
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
    const tcg = alias(tcgGroups, 'tcg');
    const condition = alias(categories, 'condition');
    const rarity = alias(categories, 'rarity');
    const finish = alias(categories, 'finish');
    const language = alias(categories, 'language');

    const result = await db.select({
      id: relics.id,
      title: relics.title,
      price: relics.price,
      imageUrl: relics.imageUrl,
      userId: relics.userId,
      inStock: relics.inStock,
      
      tcgName: tcg.name,
      conditionName: condition.name,
      rarityName: rarity.name,
      finishName: finish.name,
      languageName: language.name,
    })
    .from(relics)
    .where(eq(relics.id, relicId))
    .leftJoin(tcg, eq(relics.tcgId, tcg.id))
    .leftJoin(condition, eq(relics.conditionId, condition.id))
    .leftJoin(rarity, eq(relics.rarityId, rarity.id))
    .leftJoin(finish, eq(relics.finishId, finish.id))
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
