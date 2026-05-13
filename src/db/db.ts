import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { users, categories, relics } from './schema';

// Mudei para _v6 para processar a grande refatoração de TCG_Groups e Finishes
const expoDb = openDatabaseSync('lanceraro_v6.db');
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
    CREATE TABLE IF NOT EXISTS tcg_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      tcg_id INTEGER REFERENCES tcg_groups(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS relics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      image_url TEXT,
      user_id INTEGER REFERENCES users(id),
      tcg_id INTEGER REFERENCES tcg_groups(id),
      condition_id INTEGER REFERENCES categories(id),
      rarity_id INTEGER REFERENCES categories(id),
      finish_id INTEGER REFERENCES categories(id),
      language_id INTEGER REFERENCES categories(id),
      in_stock INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      relic_id INTEGER NOT NULL REFERENCES relics(id)
    );
  `);

  const allUsers = await db.select().from(users);
  
  if (allUsers.length === 0) {
    // Injetando o Admin e o Usuário
    await db.insert(users).values([
      { email: 'adm@gmail.com', password: '123', role: 'admin' },
      { email: 'usuario@gmail.com', password: '123', role: 'user' }
    ]);

    // INJETANDO OS JOGOS MATRIZ
    expoDb.execSync(`
      INSERT INTO tcg_groups (id, name) VALUES (1, 'Pokémon TCG'), (2, 'Magic: The Gathering'), (3, 'Yu-Gi-Oh! TCG'), (4, 'One Piece Card Game'), (5, 'Disney Lorcana'), (6, 'Flesh and Blood'), (7, 'Star Wars: Unlimited');
      
      -- Pokemon (1)
      INSERT INTO categories (name, type, tcg_id) VALUES 
      ('Common (●)', 'Rarity', 1), ('Uncommon (◆)', 'Rarity', 1), ('Rare (★)', 'Rarity', 1), ('Double Rare (★★)', 'Rarity', 1), ('Ultra Rare (2 Estrelas Prateadas)', 'Rarity', 1), ('Illustration Rare (1 Estrela Dourada)', 'Rarity', 1), ('Special Illustration Rare (2 Estrelas Douradas)', 'Rarity', 1), ('Hyper Rare (3 Estrelas Douradas)', 'Rarity', 1), ('ACE SPEC', 'Rarity', 1),
      ('Non-Foil', 'Finish', 1), ('Holofoil', 'Finish', 1), ('Reverse Holo (Corpo Brilhante)', 'Finish', 1), ('Texturizado (Embossing)', 'Finish', 1);

      -- MTG (2)
      INSERT INTO categories (name, type, tcg_id) VALUES 
      ('Common', 'Rarity', 2), ('Uncommon', 'Rarity', 2), ('Rare', 'Rarity', 2), ('Mythic Rare', 'Rarity', 2),
      ('Normal', 'Finish', 2), ('Foil Tradicional', 'Finish', 2), ('Etched Foil', 'Finish', 2), ('Borderless', 'Finish', 2), ('Extended Art', 'Finish', 2), ('Showcase Frames', 'Finish', 2);

      -- YGO (3) // Raridade é o acabamento
      INSERT INTO categories (name, type, tcg_id) VALUES 
      ('Common', 'Rarity', 3), ('Rare (Nome Prata)', 'Rarity', 3), ('Super Rare (Arte Foil)', 'Rarity', 3), ('Ultra Rare (Nome Ouro)', 'Rarity', 3), ('Secret Rare (Brilho Grade)', 'Rarity', 3), ('Ultimate Rare (Relief/3D)', 'Rarity', 3), ('Quarter Century Secret Rare', 'Rarity', 3), ('Starlight Rare', 'Rarity', 3);

      -- One Piece (4)
      INSERT INTO categories (name, type, tcg_id) VALUES 
      ('Common (C)', 'Rarity', 4), ('Uncommon (UC)', 'Rarity', 4), ('Rare (R)', 'Rarity', 4), ('Leader (L)', 'Rarity', 4), ('Super Rare (SR)', 'Rarity', 4), ('Secret Rare (SEC)', 'Rarity', 4),
      ('Normal', 'Finish', 4), ('Parallel Art (Alt-Art)', 'Finish', 4), ('Special Rare (SP)', 'Finish', 4), ('Treasure Rare (TR)', 'Finish', 4), ('Manga Rare', 'Finish', 4);

      -- Lorcana (5)
      INSERT INTO categories (name, type, tcg_id) VALUES 
      ('Common', 'Rarity', 5), ('Uncommon', 'Rarity', 5), ('Rare', 'Rarity', 5), ('Super Rare', 'Rarity', 5), ('Legendary', 'Rarity', 5),
      ('Foil', 'Finish', 5), ('Enchanted (Inkwash Foil)', 'Finish', 5), ('Epic', 'Finish', 5), ('Iconic', 'Finish', 5);

      -- FAB (6)
      INSERT INTO categories (name, type, tcg_id) VALUES 
      ('Common', 'Rarity', 6), ('Rare', 'Rarity', 6), ('Majestic', 'Rarity', 6), ('Legendary', 'Rarity', 6), ('Fabled', 'Rarity', 6), ('Marvel', 'Rarity', 6),
      ('Rainbow Foil', 'Finish', 6), ('Cold Foil (Apenas 1st Edition)', 'Finish', 6);

      -- Star Wars (7)
      INSERT INTO categories (name, type, tcg_id) VALUES 
      ('Leader/Base', 'Rarity', 7), ('Common', 'Rarity', 7), ('Uncommon', 'Rarity', 7), ('Rare', 'Rarity', 7), ('Legendary', 'Rarity', 7), ('Special', 'Rarity', 7),
      ('Foil', 'Finish', 7), ('Hyperspace (Borderless)', 'Finish', 7), ('Showcase (Apenas Líderes)', 'Finish', 7);

      -- GLOBAIS (tcg_id nulo)
      INSERT INTO categories (name, type, tcg_id) VALUES 
      ('Mint (M)', 'Condition', NULL), ('Near Mint (NM)', 'Condition', NULL), ('Slightly Played (SP)', 'Condition', NULL), ('Moderately Played (MP)', 'Condition', NULL), ('Heavily Played (HP)', 'Condition', NULL), ('Damaged (D)', 'Condition', NULL),
      ('Português (PT-BR)', 'Language', NULL), ('Inglês (EN)', 'Language', NULL), ('Japonês (JP)', 'Language', NULL);
    `);

    // Injetando a primeira Relíquia do app com a nova estrutura
    await db.insert(relics).values({
      title: 'Charizard Holográfico - 1ª Edição',
      price: 2500.50,
      tcgId: 1, // Pokemon
      finishId: 11, // Holofoil do Pokemon
      userId: 2,
      inStock: true,
    });
  }
};
