# GAFOTEC

Site vitrine + tableau de bord d’administration de GAFOTEC (corps d’état techniques, Fès).
TanStack Start (React 19, SSR) · Tailwind · Supabase (Postgres, Auth, Storage) · hébergement Vercel.

## Prérequis
- Node.js 22.x
- Un projet Supabase avec la migration `supabase/migrations/20261106000000_init_gafotec.sql` appliquée (déjà faite sur le projet GAFOTEC)

## Installation locale
```bash
git clone https://github.com/MKADDOURI-DEV/gafotec-expertise-technique.git
cd gafotec-expertise-technique
git checkout supabase-migration
npm ci
cp .env.example .env        # puis renseigner les valeurs (voir ci-dessous)
npm run dev                 # http://localhost:3000
```

## Variables d’environnement
| Variable | Où | Secrète ? |
|---|---|---|
| `VITE_SUPABASE_URL` | build + navigateur | non |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | build + navigateur | non (clé publique) |
| `SUPABASE_SERVICE_ROLE_KEY` | **serveur uniquement** | **oui** : jamais dans Git, jamais `VITE_` |
| `SUPABASE_URL` | serveur (facultatif, sinon `VITE_SUPABASE_URL`) | non |
| `VITE_ENABLE_GOOGLE_LOGIN` | build | non (`true` seulement si Google est configuré dans Supabase) |

`npm run check:bundle` (après `npm run build`) échoue si une clé de service ou un runtime Base44 se retrouve dans le bundle navigateur.

## Déploiement sur Vercel
1. Vercel → **Add New… → Project** → importer le dépôt GitHub, branche `supabase-migration` (ou la branche de production choisie).
2. Framework Preset : laisser la détection automatique (Nitro / « Other »). Build Command `npm run build`, Output Directory : par défaut. Node.js 22.x (déjà imposé par `package.json`).
3. **Settings → Environment Variables** (Production + Preview) : `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. **Deploy**. Aucun `vercel.json` n’est nécessaire : sur Vercel, Nitro génère `.vercel/output` (une fonction Node 22 qui sert toutes les routes en SSR : liens directs, rafraîchissement et pages `/nos-realisations/<slug>` compris).
5. Supabase → **Authentication → URL Configuration** : Site URL = l’URL Vercel (puis le domaine) ; Redirect URLs : `<site>/reset-password` et `<site>/login`.

## Supabase Auth (une fois)
1. **Sign In / Providers** : désactiver « Allow new users to sign up ».
2. **SMTP personnalisé** (obligatoire pour les e-mails réels ; le SMTP intégré n’écrit qu’aux membres du projet). Gratuit : Brevo ou Resend.
3. **Email templates → Confirm signup** : le gabarit doit contenir `{{ .Token }}` (code à 6 chiffres).
4. **Premier administrateur** : Authentication → Users → *Add user* (auto-confirm), puis dans le SQL Editor :
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'kaddourim297@gmail.com' and email_confirmed_at is not null);
   ```
   Le rôle `admin` ne peut être attribué que par le service role ou ce SQL ; l’API ne permet à personne de se promouvoir.
5. MFA (facultatif) : `/mfa?manage=1`. Un compte avec un authentificateur vérifié doit passer l’étape TOTP (le serveur l’impose aussi).

## Migration des données Base44 (une fois)
1. Dans Base44 : *Dashboard → Data* → exporter chaque entité (`SiteContent`, `SiteProject`, `TeamMember`, `MediaAsset`, `ContactRequest`) en JSON ou CSV dans un dossier, p. ex. `./export`.
2. Simulation : `npm run import:base44 -- ./export` (valide, signale doublons/slugs/enums, écrit `migration-report.json`).
3. Import : `SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run import:base44 -- ./export --apply` (idempotent).
4. Médias : `npm run migrate:media` (simulation) puis avec `--apply` : copie les fichiers hébergés par Base44 vers le bucket `media`, réécrit `src/` et la base. Relire `git diff`, commit.
Rien n’est supprimé côté Base44.

## Tests
| Commande | Contenu | Services |
|---|---|---|
| `npm run lint` | ESLint | n/a |
| `npm test` | 41 tests unitaires (auth, données, import, verrouillage des server functions) | aucun |
| `npm run build && npm run test:e2e` | HTTP réel sur le build de production : 401/403/400/404/409, CRUD admin, formulaire de contact, invitation | **Supabase simulé** |
| `npm run check:bundle` | aucun secret / Base44 dans le bundle navigateur | n/a |
| `npm run verify:supabase` | CRUD, RLS (anon / non-admin / admin) et Storage API réels avec données jetables nettoyées | **Supabase réel** |

## Structure utile
- `src/lib/auth-core.js`, `auth-middleware.js` : `requireUser` (401) puis `assertAdmin` (403), JWT vérifié par Supabase Auth, MFA aal2 imposé côté serveur
- `src/lib/data-api.js`, `content-fns.js`, `server-fns.js`, `user-fns.js` : accès base (client service role créé par appel, serveur uniquement)
- `src/lib/supabase.js`, `storage.js` : client navigateur (clé publique) et envoi vers Supabase Storage
- `supabase/migrations`, `supabase/rollback`, `supabase/tests` : schéma, retour arrière, tests de comportement RLS
