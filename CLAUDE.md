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
│   │   └── ui/                          # Button.svelte, Input.svelte, Card.svelte
│   │
│   ├── server/                          # 🔒 serveur uniquement
│   │   ├── db/
│   │   │   ├── index.ts                 # connexion Drizzle
│   │   │   └── schema/
│   │   │       ├── index.ts             # re-export tout
│   │   │       ├── auth.ts              # users, sessions, accounts, verifications (Better Auth)
│   │   │       ├── profiles.ts          # chiefs, customers
│   │   │       ├── chief.ts             # specialties, categories, cook, affiliate, images_chef, notices
│   │   │       ├── prestation.ts        # services, requests, menus, images_menu
│   │   │       ├── social.ts            # publications, images_publication, tags, contain, associate
│   │   │       └── messaging.ts         # messages
│   │   ├── auth.ts                      # config Better Auth
│   │   └── services/                    # logique métier (à créer)
│   │
│   ├── auth-client.ts                   # client Better Auth (utilisé côté UI)
│   ├── stores/                          # state global ($state runes)
│   └── utils/                           # helpers (formatDate, slugify...)
│
├── routes/
│   ├── +layout.svelte                   # layout racine
│   ├── +page.server.ts                  # 🔀 dispatcher pour "/" (redirige selon contexte)
│   │
│   ├── (auth)/                          # 🔓 pages publiques
│   │   ├── +layout.svelte               # layout centré, pas de navbar
│   │   ├── login/+page.svelte
│   │   ├── register/+page.svelte
│   │   └── forgot-password/+page.svelte
│   │
│   ├── (onboarding)/                    # 🆕 première visite
│   │   └── onboarding/+page.svelte
│   │
│   ├── (app)/                           # 🔒 pages protégées
│   │   ├── +layout.svelte               # navbar + sidebar
│   │   ├── +layout.server.ts            # vérifie la session → /login sinon
│   │   └── dashboard/+page.svelte       # vraie home connectée (URL: /dashboard)
│   │
│   └── api/
│       └── auth/[...all]/+server.ts     # Better Auth handler
│
├── app.d.ts                             # types globaux
├── app.html
└── hooks.server.ts                      # session middleware

```

**Conventions de groupes de routes :**

- **`/` (racine)** → `+page.server.ts` est un dispatcher (3-way redirect : `/dashboard`, `/login`, `/onboarding`), aucune page rendue
- `(auth)` → pages publiques avec layout centré
- `(app)` → pages protégées (vérifie session → redirige vers `/login` sinon). **Vraie home = `/dashboard`**
- `(onboarding)` → première visite, pas de layout app

---

## Modèle de données (MPD)

Plateforme avec **héritage Users → Customers/Chiefs**. Better Auth est configuré avec `modelName` pour mapper directement sur nos tables métier (pas de table `user` séparée).

### `schema/auth.ts` — Better Auth

**`users`** — table principale (gérée par Better Auth + champs métier)
| Colonne | Type | Contraintes |
|---|---|---|
| id | text | PK |
| name | varchar(50) | NOT NULL |
| email | varchar(128) | NOT NULL, UNIQUE |
| email_verified | boolean | default false |
| image | varchar(255) | |
| firstname | varchar(50) | NOT NULL |
| role | varchar(50) | NOT NULL, default 'customer' |
| localization | varchar(128) | NOT NULL |
| upload_profile_picture | date | |
| created_at | timestamp | default now() |
| updated_at | timestamp | auto-update |

**`sessions`** — sessions Better Auth
| Colonne | Type |
|---|---|
| id | text PK |
| expires_at | timestamp |
| token | text UNIQUE |
| ip_address | text |
| user_agent | text |
| user_id | text → users.id CASCADE |

**`accounts`** — OAuth providers
| Colonne | Type |
|---|---|
| id | text PK |
| account_id | text |
| provider_id | text |
| user_id | text → users.id CASCADE |
| password | varchar(255) |
| access_token / refresh_token / id_token | text |
| access_token_expires_at / refresh_token_expires_at | timestamp |
| scope | text |

**`verifications`** — tokens de vérification email / reset password
| Colonne | Type |
|---|---|
| id | text PK |
| identifier | text |
| value | text |
| expires_at | timestamp |

---

### `schema/profiles.ts` — Héritage utilisateurs

**`chiefs`** — profil chef (1-1 avec users)
| Colonne | Type | Contraintes |
|---|---|---|
| id_chief | text | PK → users.id CASCADE |
| bio_chief | text | |
| note_chief | decimal(2,1) | |

**`customers`** — profil client (1-1 avec users)
| Colonne | Type | Contraintes |
|---|---|---|
| id_customer | text | PK → users.id CASCADE |
| preferences_customer | text | NOT NULL |

---

### `schema/chief.ts` — Domaine chef

**`specialties`**
| Colonne | Type |
|---|---|
| id_speciality | serial PK |
| name_speciality | varchar(50) NOT NULL |
| description_speciality | text |

**`categories`**
| Colonne | Type |
|---|---|
| id_category | serial PK |
| name_category | varchar(50) NOT NULL |

**`cook`** — M:N chiefs ↔ specialties
| Colonne | Type |
|---|---|
| id_chief | text → chiefs.id_chief CASCADE |
| id_speciality | integer → specialties.id_speciality CASCADE |
| PK | (id_chief, id_speciality) |

**`affiliate`** — M:N chiefs ↔ categories
| Colonne | Type |
|---|---|
| id_chief | text → chiefs.id_chief CASCADE |
| id_category | integer → categories.id_category CASCADE |
| PK | (id_chief, id_category) |

**`images_chef`**
| Colonne | Type |
|---|---|
| id_image_chef | serial PK |
| url_image_chef | varchar(255) |
| upload_image_chef | date |
| id_chief | text → chiefs.id_chief CASCADE |

**`notices`** — avis clients sur un chef
| Colonne | Type |
|---|---|
| id_notice | serial PK |
| rating_notice | decimal(2,1) NOT NULL |
| comment_notice | text |
| date_notice | date NOT NULL |
| id_customer | text → customers.id_customer CASCADE |
| id_chief | text → chiefs.id_chief CASCADE |

---

### `schema/prestation.ts` — Domaine prestation

**`services`** — prestation réalisée
| Colonne | Type |
|---|---|
| id_service | serial PK |
| date_service | date NOT NULL |
| price_service | decimal(5,2) NOT NULL |
| statut_service | varchar(50) NOT NULL |
| id_customer | text → customers.id_customer CASCADE |
| id_chief | text → chiefs.id_chief CASCADE |

**`requests`** — demande client
| Colonne | Type |
|---|---|
| id_request | serial PK |
| description_request | text NOT NULL |
| expected_date_request | date NOT NULL |
| guests_request | integer NOT NULL |
| type_event_request | varchar(50) |
| localization_request | varchar(100) NOT NULL |
| statut_request | varchar(50) NOT NULL |
| id_service | integer → services.id_service SET NULL |
| id_customer | text → customers.id_customer CASCADE |

**`menus`**
| Colonne | Type |
|---|---|
| id_menu | serial PK |
| title_menu | varchar(100) NOT NULL |
| description_menu | text NOT NULL |
| price_menu | decimal(5,2) NOT NULL |
| id_chief | text → chiefs.id_chief CASCADE |

**`images_menu`**
| Colonne | Type |
|---|---|
| id_image_menu | serial PK |
| url_image_menu | varchar(255) |
| upload_image_menu | date |
| id_menu | integer → menus.id_menu CASCADE |

---

### `schema/social.ts` — Domaine social

**`images_publication`**
| Colonne | Type |
|---|---|
| id_image_publication | serial PK |
| url_image_publication | varchar(255) |
| upload_image_publication | date |

**`publications`**
| Colonne | Type |
|---|---|
| id_publication | serial PK |
| content_publication | text NOT NULL |
| date_publication | date NOT NULL |
| likes_publication | integer default 0 |
| id_image_publication | integer → images_publication SET NULL |
| id_users | text → users.id CASCADE |

**`tags`**
| Colonne | Type |
|---|---|
| id_tag | serial PK |
| name_tag | varchar(50) NOT NULL |

**`contain`** — M:N publications ↔ tags
| Colonne | Type |
|---|---|
| id_publication | integer → publications.id_publication CASCADE |
| id_tag | integer → tags.id_tag CASCADE |
| PK | (id_publication, id_tag) |

**`associate`** — M:N tags ↔ requests
| Colonne | Type |
|---|---|
| id_tag | integer → tags.id_tag CASCADE |
| id_request | integer → requests.id_request CASCADE |
| PK | (id_tag, id_request) |

---

### `schema/messaging.ts` — Messagerie

**`messages`**
| Colonne | Type |
|---|---|
| id_message | serial PK |
| content_message | text NOT NULL |
| expedition_date_message | date NOT NULL |
| read_message | boolean default false |
| id_sender | text → users.id CASCADE |
| id_recipient | text → users.id CASCADE |

---

## Auth

**Méthodes activées :**

- Email + password
- Google OAuth (credentials dans `.env`)
- Reset password (TODO: brancher Resend/Nodemailer)

**Flow protection :**

1. Visiteur arrive sur `/` → `routes/+page.server.ts` (dispatcher)
   - Connecté → `/dashboard`
   - Cookie `onboarding_seen` présent → `/login`
   - Sinon → `/onboarding`
2. Pages dans `(app)/` → `(app)/+layout.server.ts` vérifie la session, redirige vers `/login` sinon
3. Pages dans `(auth)/` et `(onboarding)/` → publiques, aucune protection

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
- **Better Auth User vs Users métier** — **décision prise** : Better Auth mappe directement sur `users` via `modelName`. Champs additionnels (`firstname`, `role`, `localization`, `upload_profile_picture`) ajoutés dans `auth.ts` via `user.additionalFields`. Pas de table séparée.
