# Nasazení na web ClarityX

Doporučená produkční architektura:

- aplikace: Vercel
- databáze: Neon PostgreSQL, Supabase PostgreSQL, Railway PostgreSQL nebo vlastní PostgreSQL
- doména: `audit.clarityx.cz`
- vstup z webu: odkaz nebo iframe na `/embed/clarityx`

## 1. Připrav databázi

Vytvoř PostgreSQL databázi a zkopíruj connection string do `DATABASE_URL`.

Příklad:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"
```

## 2. Nastav Vercel environment variables

Ve Vercelu nastav pro Production:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://audit.clarityx.cz
APP_URL=https://audit.clarityx.cz
UPLOAD_DIR=./uploads
PDF_EXPORT_DIR=./exports
```

`NEXTAUTH_SECRET` vygeneruj:

```bash
openssl rand -base64 32
```

## 3. Nasaď aplikaci

Vercel build command:

```bash
npm run build
```

Start command nech standardní pro Next.js.

## 4. Proveď migrace a seed

Po prvním nasazení spusť v produkčním prostředí:

```bash
npm run prisma:deploy
npm run prisma:seed
```

Seed vytvoří demo admin/auditor/viewer účty a NIS2 šablony. V produkci po prvním přihlášení změň demo hesla nebo demo uživatele smaž.

## 5. Připoj doménu

Ve Vercelu přidej doménu:

```text
audit.clarityx.cz
```

V DNS ClarityX nastav záznam podle instrukcí Vercelu, typicky `CNAME`.

## 6. Vložení do webu ClarityX

Tlačítko:

```html
<a href="https://audit.clarityx.cz/embed/clarityx">
  Spustit IT audit
</a>
```

Iframe:

```html
<iframe
  src="https://audit.clarityx.cz/embed/clarityx"
  title="ClarityX IT & Cyber Audit"
  style="width:100%;height:720px;border:0;"
></iframe>
```

Pro přihlášení v iframe je nejlepší, aby aplikace běžela na subdoméně stejné hlavní domény, tedy `audit.clarityx.cz`.
