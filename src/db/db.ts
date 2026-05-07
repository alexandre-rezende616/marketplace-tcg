import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { users, categories, relics } from './schema';

// Mudei para _v5 para o Expo criar um banco do zero e incluir a coluna de Apelido!
const expoDb = openDatabaseSync('lanceraro_v5.db');
export const db = drizzle(expoDb);

export const seedDatabase = async () => {
  // Força a criação das tabelas caso elas não existam no banco novo
  expoDb.execSync(`
    PRAGMA foreign_keys = ON;
    
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar_url TEXT,
      nickname TEXT
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS relics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      image_url TEXT,
      user_id INTEGER REFERENCES users(id),
      category_id INTEGER REFERENCES categories(id),
      condition_id INTEGER REFERENCES categories(id),
      rarity_id INTEGER REFERENCES categories(id),
      language_id INTEGER REFERENCES categories(id),
      in_stock INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      relic_id INTEGER NOT NULL REFERENCES relics(id)
    );
  `);

  // // TODOS: Lembrem que mudei o nome do banco pra _v5 pra resetar os dados no celular
  const allUsers = await db.select().from(users);
  
  if (allUsers.length === 0) {
    // Injetando o Admin e o Usuário
    await db.insert(users).values([
      { email: 'adm@gmail.com', password: '123', role: 'admin' },
      { email: 'usuario@gmail.com', password: '123', role: 'user' }
    ]);

    // O COMPILADO DE CATEGORIAS QUE O LUCAS ANOTOU
    await db.insert(categories).values([
      // TCGs
      { name: 'Pokémon TCG', type: 'TCG' },
      { name: 'Magic: The Gathering', type: 'TCG' },
      { name: 'Yu-Gi-Oh! TCG', type: 'TCG' },
      { name: 'One Piece Card Game', type: 'TCG' },
      { name: 'Disney Lorcana', type: 'TCG' },
      { name: 'Digimon Card Game', type: 'TCG' },
      { name: 'Flesh and Blood', type: 'TCG' },
      { name: 'Star Wars: Unlimited', type: 'TCG' },

      // Raridades
      { name: 'Comum', type: 'Rarity' },
      { name: 'Incomum', type: 'Rarity' },
      { name: 'Rara', type: 'Rarity' },
      { name: 'Mítica', type: 'Rarity' },
      { name: 'Ultra Rara', type: 'Rarity' },
      { name: 'Secreta', type: 'Rarity' },
      { name: 'Promo', type: 'Rarity' },

      // Acabamentos / Tratamentos
      { name: 'Normal', type: 'Finish' },
      { name: 'Foil', type: 'Finish' },
      { name: 'Holo', type: 'Finish' },
      { name: 'Reverse Foil', type: 'Finish' },
      { name: 'Full Art', type: 'Finish' },
      { name: 'Alt Art', type: 'Finish' },
      { name: 'Extended Art', type: 'Finish' },
      { name: 'Ghost Rare', type: 'Finish' },

      // Estado de Conservação (Crucial)
      { name: 'Mint (M)', type: 'Condition' },
      { name: 'Near Mint (NM)', type: 'Condition' },
      { name: 'Slightly Played (SP)', type: 'Condition' },
      { name: 'Moderately Played (MP)', type: 'Condition' },
      { name: 'Heavily Played (HP)', type: 'Condition' },
      { name: 'Damaged (D)', type: 'Condition' },

      // Idioma
      { name: 'Português (PT-BR)', type: 'Language' },
      { name: 'Inglês (EN)', type: 'Language' },
      { name: 'Japonês (JP)', type: 'Language' }
    ]);

    // Injetando a primeira Relíquia do app com a nova estrutura
    await db.insert(relics).values({
      title: 'Charizard Holográfico - 1ª Edição',
      price: 2500.50,
      categoryId: 1, // ID 1 agora é definitivamente Pokémon TCG
      userId: 2,
      inStock: true,
    });
  }
};
