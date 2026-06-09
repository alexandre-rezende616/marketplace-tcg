# 🗡️ Lance Raro - Marketplace TCG

Bem-vindo à Taverna! O **Lance Raro** é um aplicativo mobile desenvolvido com **React Native** e **Expo**, projetado para ser um marketplace imersivo de Trading Card Games (TCGs). Com uma identidade visual rústica de fantasia medieval, o app permite que aventureiros (usuários) comprem, vendam e gerenciem suas cartas raras.

O grande diferencial deste projeto é sua **Arquitetura Taxonômica de Dados**, que gerencia de forma inteligente a hierarquia complexa de raridades e acabamentos de múltiplos jogos de cartas (Pokémon, Magic, Yu-Gi-Oh!, Star Wars, etc.).

---

## ✨ Principais Funcionalidades

* 🛡️ **Autenticação de Aventureiros:** Login, Cadastro e perfis customizáveis com avatares dinâmicos (UI-Avatars).
* 📜 **Mural da Guilda (Home):** Feed de anúncios com filtros cruzados globais (Idioma, Conservação) e dinâmicos (Raridade específica baseada no Jogo).
* 📸 **Forja de Relíquias (Anúncios):** Publicação de cartas com suporte a múltiplas fotos (Câmera ou Galeria) e formulários dinâmicos que bloqueiam combinações impossíveis (Ex: Um "Showcase" não pode existir fora de Star Wars).
* ✨ **Destaques VIP:** Sistema de monetização com impulsionamento de anúncios (Ouro, Prata, Bronze) e expiração automática controlada pelo servidor.
* 🔔 **Correio da Taverna:** Sistema de notificações In-App para avisar os aventureiros sobre status de compras e validades de destaques.
* 📍 **Geolocalização Automática:** Integração com o GPS do aparelho para capturar coordenadas e filtrar relíquias por região no Mural.
*  **Painel do Mestre da Taverna (Admin):** Área restrita com indicadores de BI (Business Intelligence) e controle absoluto do catálogo taxonômico (Criação e Expurgação de filtros).
* 🎒 **Inventário:** Gerenciamento de cartas publicadas e lista de desejos (Favoritos).

---

## 🛠️ Stack Tecnológico

* **Frontend Mobile:** React Native + Expo
* **Mapa e Localização:** `expo-location`
* **Linguagem:** TypeScript
* **Navegação:** React Navigation (Tabs & Stacks)
* **Integração:** Consumo de API REST (Java Spring Boot)
* **Ícones:** Lucide React Native
* **Mídia:** `expo-image-picker`

---

## 🏗️ Backend e Banco de Dados

O aplicativo se comunica com uma API robusta desenvolvida em **Java Spring Boot**. O banco de dados evoluiu para utilizar **PostgreSQL** hospedado na nuvem (Neon), garantindo persistência e velocidade em escala global.

🔗 **Repositório do Backend:** backend-lance-raro

O backend possui um script de **Database Seeding** (através do `DataSeeder.java`) que injeta os usuários, categorias (Regras Taxonômicas), grupos e relíquias de teste ao subir o servidor pela primeira vez.

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
* Node.js instalado.
* Aplicativo **Expo Go** instalado no seu celular (iOS ou Android) OU um emulador configurado no PC.

### Passo a Passo

1. **Configure e rode o Backend:**
   * Siga as instruções no repositório do backend para iniciar a API na sua máquina local.

2. **Configuração de IP:**
   * Como o app roda em um emulador ou dispositivo físico e a API roda localmente na sua máquina, você precisará **atualizar o IP** em todas as requisições.
   * Abra o arquivo `src/services/api.ts` e altere a constante global `BASE_URL` (ex: `http://10.65.65.125:8080/api`) usando o endereço IPv4 da sua máquina na rede atual.
   * *Dica:* No Windows, abra o CMD e digite `ipconfig` para descobrir seu endereço IPv4 local.

3. **Clone o repositório do App:**
   ```bash
   git clone https://github.com/alexandre-rezende616/marketplace-tcg.git
   cd marketplace-tcg
   cd lance-raro
   ```

4. **Instale as dependências:**
   ```bash
   npm install
   ```

5. **Inicie o servidor do Expo:**
   ```bash
   npx expo start
   ```

6. **Abra o aplicativo:**
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