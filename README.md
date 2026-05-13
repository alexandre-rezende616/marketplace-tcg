# 🗡️ Lance Raro - Marketplace TCG

Bem-vindo à Taverna! O **Lance Raro** é um aplicativo mobile desenvolvido com **React Native** e **Expo**, projetado para ser um marketplace imersivo de Trading Card Games (TCGs). Com uma identidade visual rústica de fantasia medieval, o app permite que aventureiros (usuários) comprem, vendam e gerenciem suas cartas raras.

O grande diferencial deste projeto é sua **Arquitetura Taxonômica de Dados**, que gerencia de forma inteligente a hierarquia complexa de raridades e acabamentos de múltiplos jogos de cartas (Pokémon, Magic, Yu-Gi-Oh!, Star Wars, etc.).

---

## ✨ Principais Funcionalidades

* 🛡️ **Autenticação de Aventureiros:** Login, Cadastro e perfis customizáveis com avatares dinâmicos (UI-Avatars).
* 📜 **Mural da Guilda (Home):** Feed de anúncios com filtros cruzados globais (Idioma, Conservação) e dinâmicos (Raridade específica baseada no Jogo).
* 📸 **Forja de Relíquias (Anúncios):** Publicação de cartas com suporte a múltiplas fotos (Câmera ou Galeria) e formulários dinâmicos que bloqueiam combinações impossíveis (Ex: Um "Showcase" não pode existir fora de Star Wars).
* 👑 **Painel do Mestre da Taverna (Admin):** Área restrita com indicadores de BI (Business Intelligence) e controle absoluto do catálogo taxonômico (Criação e Expurgação de filtros).
* 🎒 **Inventário:** Gerenciamento de cartas publicadas e lista de desejos (Favoritos).

---

## 🛠️ Stack Tecnológico

* **Frontend Mobile:** React Native + Expo
* **Linguagem:** TypeScript
* **Navegação:** React Navigation (Tabs & Stacks)
* **Banco de Dados (Local):** `expo-sqlite` (SQLite rodando nativamente)
* **ORM:** Drizzle ORM (`drizzle-orm/expo-sqlite`)
* **Ícones:** Lucide React Native
* **Mídia:** `expo-image-picker`

---

## 🏗️ Arquitetura de Dados e "Seed" Automático

Este projeto não necessita de um servidor externo para rodar em ambiente de desenvolvimento. O banco de dados SQLite é instanciado localmente no dispositivo. 

O app possui um script inteligente de **Database Seeding**. Quando você clona o projeto e abre o aplicativo pela primeira vez:
1. O Expo verifica que o arquivo `.db` não existe e cria um novo banco vazio.
2. O Drizzle ORM executa a criação rígida das tabelas (Users, Relics, Categories, TcgGroups, Favorites).
3. O script injeta centenas de registros contendo as **Regras Taxonômicas Oficiais de 2026** (Ex: "Hyper Rare" associado exclusivamente a "Pokémon TCG"), além de usuários e produtos de teste.

> **Segurança:** O uso de `ON DELETE CASCADE` garante que, caso o Admin delete um jogo matriz, todas as suas raridades filhas sejam purgadas, evitando lixo no banco de dados.

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
* Node.js instalado.
* Aplicativo **Expo Go** instalado no seu celular (iOS ou Android) OU um emulador configurado no PC.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/alexandre-rezende616/marketplace-tcg.git
   cd marketplace-tcg
   cd lance-raro
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor do Expo:**
   ```bash
   npx expo start
   ```

4. **Abra o aplicativo:**
   * Escaneie o QR Code que aparecerá no terminal usando o aplicativo **Expo Go** no seu celular.
   * Ou pressione `a` no terminal para abrir no emulador Android.

---

## 🧙‍♂️ Usuários de Teste (Criados automaticamente pelo Seed)

Use as credenciais abaixo para testar as diferentes permissões do sistema:

**Usuário Padrão (Aventureiro):**
* **E-mail:** `usuario@gmail.com`
* **Senha:** `123`

**Administrador (Mestre da Taverna):**
* **E-mail:** `adm@gmail.com`
* **Senha:** `123`

---

## 🎨 Identidade Visual
A paleta de cores do app remete a madeiras, papéis antigos e metais preciosos:
* **Carvalho Escuro** (`#1A0F0A`, `#25160F`, `#3A2418`)
* **Pergaminho** (`#EADBB0`)
* **Dourado Nobre** (`#C8A951`)
* **Rubi Bordô** (`#8B0000`)