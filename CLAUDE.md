# Gustichef

Plateforme web (responsive mobile-first) de mise en relation entre **chefs cuisiniers** et **clients particuliers**. L'app web sera ensuite empaquetée dans une **coquille native Capacitor** pour iOS/Android.

---

## Stack technique

| Catégorie                   | Outil        | Version                   |
| --------------------------- | ------------ | ------------------------- |
| Framework                   | SvelteKit    | 2.x (Svelte 5 avec runes) |
| Langage                     | TypeScript   | 5.x                       |
| ORM                         | Drizzle ORM  | 0.45.x                    |
| Base de données             | PostgreSQL   | 16 (Docker)               |
| Auth                        | Better Auth  | 1.4.x                     |
| Style                       | Tailwind CSS | 4.x                       |
| Tests unitaires             | Vitest       | 4.x                       |
| Tests E2E                   | Playwright   | 1.59.x                    |
| Package manager             | pnpm         | 10.x                      |
| Empaquetage natif (à venir) | Capacitor    | -                         |

---

## Architecture

Structure SvelteKit complète et propre

```
src/
├── lib/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                          # Button.svelte, Input.svelte, Card.svelte
│   │   └── recipe/                      # RecipeCard.svelte, RecipeForm.svelte
│   │
│   ├── server/                          # 🔒 serveur uniquement
│   │   ├── db/
│   │   │   ├── index.ts                 # connexion Drizzle
│   │   │   └── schema/
│   │   │       ├── index.ts             # re-export tout
│   │   │       ├── auth.ts              # tables Better Auth
│   │   │       ├── user.ts              # table users custom
│   │   │       └── recipe.ts            # tables recipes
│   │   ├── auth.ts                      # config Better Auth
│   │   └── services/                    # logique métier
│   │       ├── recipe.service.ts
│   │       └── user.service.ts
│   │
│   ├── auth-client.ts                   # client Better Auth (utilisé côté UI)
│   ├── stores/                          # state global ($state runes)
│   └── utils/                           # helpers (formatDate, slugify...)
│
├── routes/
│   ├── (auth)/                          # 🔓 pages publiques
│   │   ├── +layout.svelte               # layout centré, pas de navbar
│   │   ├── login/+page.svelte
│   │   ├── register/+page.svelte
│   │   └── forgot-password/+page.svelte
│   │
│   ├── (app)/                           # 🔒 pages protégées
│   │   ├── +layout.svelte               # navbar + sidebar
│   │   ├── +layout.server.ts            # vérifie la session
│   │   ├── +page.svelte                 # dashboard
│   │   ├── recipes/
│   │   │   ├── +page.svelte             # liste
│   │   │   ├── +page.server.ts          # load + actions
│   │   │   └── [id]/
│   │   │       ├── +page.svelte         # détail
│   │   │       └── +page.server.ts
│   │   └── profile/+page.svelte
│   │
│   └── api/
│       └── auth/[...all]/+server.ts     # Better Auth handler
│
├── app.d.ts                             # types globaux
├── app.html
└── hooks.server.ts                      # session middleware

```

**Conventions de groupes de routes :**

- `(auth)` → pages publiques avec layout centré
- `(app)` → pages protégées (redirige vers `/login` sinon)
- `(onboarding)` → première visite, pas de layout app

---

## Modèle de données (MPD)

Plateforme avec **héritage Users → Customers/Chiefs** :

**Domaine utilisateurs**

- `users` (base) → `customers` ou `chiefs` (FK 1-1)
- `messages` (entre users)

**Domaine chef**

- `chiefs` ↔ `specialties` (M:N via `cook`)
- `chiefs` ↔ `categories` (M:N via `affiliate`)
- `pictures_chief`
- `notices` (avis clients)

**Domaine prestation**

- `requests` (demande client) → `services` (prestation effective)
- `menus` proposés par chef + `pictures_menu`

**Domaine social**

- `publications` + `pictures_publication`
- `tags` ↔ `publications` (via `contain`)
- `tags` ↔ `requests` (via `associate`)

⚠️ **Better Auth a sa propre table `user`** — décider plus tard si on fusionne avec `users` métier ou si on garde séparé (FK).

---

## Auth

**Méthodes activées :**

- Email + password
- Google OAuth (credentials dans `.env`)
- Reset password (TODO: brancher Resend/Nodemailer)

**Flow protection :**

1. Visiteur arrive sur `/` → `(app)/+layout.server.ts` vérifie session
2. Pas de session → redirect vers `/login`
3. Session OK → accès aux pages app

**Routes API auth :** `routes/api/auth/[...all]/+server.ts` (handler Better Auth)

---

## Onboarding (à implémenter)

**Flow visiteur première fois :**

1. **Onboarding 1** — slider images plats + "Voyage culinaire pas si loin que ça"
2. **Onboarding 2-4** — slides de présentation (chefs, expérience gastronomique)
3. **Onboarding 5/6** — choix profil : **Chef** ou **Particulier**
4. → Redirige vers `/register?role=chef` ou `/register?role=customer`

**Persistance :**

Cookie côté serveur `onboarding_seen=true` (1 an), pas de localStorage (évite le flash).

**Logique de redirection** dans `routes/+page.server.ts` :

1. Session active ? → `/` (app)
2. Cookie `onboarding_seen` présent ? → `/login`
3. Sinon → `/onboarding`

À la fin de l'onboarding, set le cookie puis redirect vers `/register?role=chef|customer`.

---

## Base de données

**Setup local :**

- Docker Compose (`docker-compose.yaml`) avec Postgres 16
- Port `5432:5432`
- Credentials dans `.env` (jamais committés)

**Commandes :**

```powershell
pnpm db:start              # démarre Docker
pnpm db:push               # push schéma (dev)
pnpm db:studio             # UI Drizzle
pnpm auth:schema           # régénère schema Better Auth
```

**⚠️ Conflit port 5432 :** PostgreSQL local Windows (`postgresql-x64-18`) prend le port. Le stopper avant de démarrer Docker :

```powershell
Stop-Service postgresql-x64-18    # PowerShell admin
```

---

## Tests (TDD)

**Setup :** Vitest + Playwright installés mais pas encore de tests écrits.

**Commandes :**

```powershell
pnpm test:unit             # Vitest
pnpm test:e2e              # Playwright
pnpm test                  # les deux
```

**Stratégie TDD :**

1. **🔴 Red** — écrire test qui échoue
2. **🟢 Green** — coder pour faire passer
3. **🔵 Refactor** — nettoyer

**Premiers tests à écrire :**

- E2E : register, login, forgot password, onboarding flow
- Unit : helpers de validation (email, password)

---

## CI/CD

**CI configurée** : `.github/workflows/ci.yml`

- Tourne sur push/PR vers `main`
- Service Postgres pour les tests
- Steps : install → lint → check → db:push → tests → build

**Pas de CD pour l'instant** — déploiement à définir.

---

## Capacitor (à venir)

Une fois la web app stable :

1. `pnpm add @capacitor/core @capacitor/cli`
2. `npx cap init`
3. `npx cap add ios && npx cap add android`
4. Build SvelteKit en mode static → `npx cap sync`

---

## Variables d'environnement

`.env` (jamais committé) — `.env.example` pour reference :

```env
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
PORT_DB="5432"
POSTGRES_USER="user"
POSTGRES_PASSWORD="pass"
POSTGRES_DB="dbname"
ORIGIN="http://localhost:5173"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
BETTER_AUTH_SECRET=""
```

---

## Décisions importantes

- **Svelte 5 avec runes** — utiliser `$state()`, `$props()`, `onsubmit` (pas `on:submit`)
- **Mobile-first** — designs en portrait, viewport ~375px de base
- **Pas de SSR pour Capacitor** — passer en `adapter-static` quand on empaquète
- **Better Auth User vs Users métier** — séparés pour l'instant, à arbitrer
