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

* **Frontend Mobile:** React Native 0.88 + Expo SDK 58
* **Mapa e Localização:** `expo-location`
* **Linguagem:** TypeScript
* **Navegação:** React Navigation (Tabs & Stacks)
* **Integração:** API REST via Axios; estado remoto e cache com TanStack Query
* **Ícones:** Lucide React Native
* **Mídia:** `expo-image-picker`

---

## 🏗️ Backend e Banco de Dados

O aplicativo se comunica com uma API robusta desenvolvida em **Java Spring Boot**. O banco de dados evoluiu para utilizar **PostgreSQL** hospedado na nuvem (Neon), garantindo persistência e velocidade em escala global.

🔗 **Repositório do Backend:** [backend-lance-raro](https://github.com/alexandre-rezende616/backend-lance-raro.git)

O backend possui um script de **Database Seeding** (através do `DataSeeder.java`) que injeta os usuários, categorias (Regras Taxonômicas), grupos e relíquias de teste ao subir o servidor pela primeira vez.

---

## 🚀 Execução do Projeto (Passo a Passo)

### 💻 Execução do Código Fonte (Desenvolvimento)

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
     .\mvnw.cmd spring-boot:run
     ```

3. **Configuração da conexão no Mobile:**
   * O app usa a URL de produção por padrão. Para apontar para um backend local, crie um arquivo `.env` na raiz do app com `EXPO_PUBLIC_API_URL=http://SEU_IP:8080/api`.
   * Em um aparelho físico, use o IPv4 da máquina na rede local. No emulador Android, use `http://10.0.2.2:8080/api`.
   * A URL é lida por `src/services/api.ts`; reinicie o Expo depois de criar ou alterar o `.env`.

4. **Execução do Frontend (React Native):**
   ```bash
   cd marketplace-tcg
   npm install
   npx expo start
   ```

5. **Abra o aplicativo:**
   * Escaneie o QR Code que aparecerá no terminal usando o aplicativo **Expo Go** no seu celular.
   * Ou pressione `a` no terminal para abrir no emulador Android.
   * Mantenha o Expo Go atualizado pela loja do aparelho e use `npx expo start --clear` após trocar de SDK. O Expo Go e o projeto precisam usar o mesmo SDK.

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
A interface preserva o tema da Taverna com componentes reutilizáveis e tokens centralizados em `src/theme/tokens.ts`.

| Token | Valor | Uso |
| --- | --- | --- |
| Fundo / Carvalho | `#2C1B12` | Fundo e navegação |
| Superfície elevada | `#3A2418` | Painéis escuros |
| Pergaminho | `#F5E6BE` | Conteúdo e cartões |
| Pergaminho suave | `#EADBB0` | Campos e superfícies de leitura |
| Dourado | `#D4AF37` | Ações principais e destaque |
| Verde | `#3E5622` | Sucesso e disponibilidade |
| Rubi | `#7B1113` | Erros e ações destrutivas |
| Azul | `#2B4C7E` | Informação e ações secundárias |

Espaçamentos, raios e escala tipográfica também ficam nos tokens. Os componentes de base estão em `src/components/ui`: `AppText`, `Button`, `Card` e `TextField`.

## 🌐 Networking e estado remoto

`src/services/api.ts` centraliza as chamadas HTTP em uma instância Axios com timeout e URL configurável por `EXPO_PUBLIC_API_URL`. Erros HTTP e de rede são propagados para a interface, em vez de serem convertidos em listas vazias ou resultados de sucesso.

TanStack Query gerencia cache, carregamento, atualização e invalidação dos dados remotos. O cache padrão considera os dados recentes por 30 segundos, atualiza ao voltar para o app e é invalidado depois de alterações em anúncios, favoritos, notificações e filtros.

## 🧪 Verificações

* App: `npx tsc --noEmit`
* Backend: `.\mvnw.cmd test`
* Os testes do backend usam H2 em memória no perfil `test`; não precisam de conexão com o Neon.
