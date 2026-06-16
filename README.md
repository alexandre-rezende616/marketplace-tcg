# 🗡️ Lance Raro - Marketplace TCG

Bem-vindo à Taverna! O **Lance Raro** é um aplicativo mobile desenvolvido com **React Native** e **Expo**, projetado para ser um marketplace imersivo de Trading Card Games (TCGs). Com uma identidade visual rústica de fantasia medieval, o app permite que aventureiros (usuários) comprem, vendam e gerenciem suas cartas raras.

O grande diferencial deste projeto é sua **Arquitetura Taxonômica de Dados**, que gerencia de forma inteligente a hierarquia complexa de raridades e acabamentos de múltiplos jogos de cartas (Pokémon, Magic, Yu-Gi-Oh!, Star Wars, etc.).

## 👥 Integrantes e Atribuições

Abaixo estão os desenvolvedores do projeto e as principais responsabilidades de cada um para a entrega final:

* **Alexandre Torres Rezende (UC24200528)**: Desenvolvimento Frontend Mobile (React Native/Expo), Autenticação de Aventureiros, Lógica de Telas e Build de Produção (EAS/APK).
* **Bruno Braga dos Santos (UC24202928)**: UI/UX Design (Wireframes), Identidade Visual (Cores e Tipografia), Estilização de Componentes e Layout das Telas (Mural, Perfil, Formulários).
* **Iuri Pereira Marques (UC24202519)**: Integração do Gateway de Pagamentos (AbacatePay/Webhooks), Gerenciamento de Rotas In-App e Mapeamento dos Serviços de Conexão (`api.ts`).
* **Lucas Paulo de Souza Farias (UC24202620)**: Arquitetura do Banco de Dados (PostgreSQL/Neon), Modelagem de Entidade-Relacionamento e Estruturação Taxonômica (Matrizes TCG, Raridades, Condições).
* **lucas bezerra de castro (UC24201568)**: Desenvolvimento Backend (Java Spring Boot), Endpoints REST, Deploy Nuvem (Render) e Scripts de Povoamento de Dados (`DataSeeder`).

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

## 🚀 Execução do Projeto (Passo a Passo)

> **⚠️ Nota de Versão:** A versão final do aplicativo para a avaliação encontra-se na branch `main`.

### Pré-requisitos
### 📱 Opção 1: Instalação Rápida (Recomendado para Avaliadores)
Para facilitar o teste e a avaliação do projeto, disponibilizamos a build final em formato `.apk` (para Android), já configurada para se conectar ao nosso banco de dados e backend na nuvem.

* **Link para Download do APK:** Página de Build do Expo (Lance Raro)
* Basta acessar o link, fazer o download do arquivo `.apk`, transferir para um dispositivo Android e realizar a instalação.

https://expo.dev/accounts/half-dead/projects/lance-raro/builds/e5cf624b-3b60-4b75-b0e1-d11bf0d0cbd2
---

### 💻 Opção 2: Execução do Código Fonte (Desenvolvimento)

#### Pré-requisitos
* Node.js instalado.
* Aplicativo **Expo Go** instalado no seu celular (iOS ou Android) OU um emulador configurado no PC.
* Java 21 e Maven instalados (caso vá executar o servidor localmente ao invés de usar a nuvem).

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/alexandre-rezende616/marketplace-tcg.git
   ```

2. **Execução do Backend (Java Spring Boot):**
   * Abra o terminal na pasta raiz do backend.
   * O sistema conta com um arquivo `DataSeeder.java`. Portanto, **não é necessário popular o banco de dados manualmente**. Ao iniciar, a API injetará os usuários, jogos (TCGs), categorias e anúncios de teste automaticamente.
   * Para iniciar a API:
     ```bash
     mvn spring-boot:run
     ```

3. **Configuração da Conexão no Mobile:**
   * Navegue até o arquivo `src/services/api.ts`.
   * Caso vá testar consumindo o backend local, altere o valor da `BASE_URL` para o endereço IPv4 da sua máquina local (Ex: `http://192.168.0.15:8080/api`).
   * Caso vá testar a aplicação em Produção, a `BASE_URL` já estará apontando para o Render (`https://lance-raro-api.onrender.com/api`).

4. **Execução do Frontend (React Native):**
   ```bash
   cd lance-raro
   npm install
   npx expo start
   ```

6. **Abra o aplicativo:**
   * Escaneie o QR Code que aparecerá no terminal usando o aplicativo **Expo Go** no seu celular.
   * Ou pressione `a` no terminal para abrir no emulador Android.

---

## 🧙‍♂️ População Inicial (Seed) e Contas de Teste

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