# IT & Cybersecurity Audit Platform

Full-stack MVP aplikace pro komplexní IT, kyberbezpečnostní a NIS2 audit firem. Aplikace je v češtině a podporuje klienty, audity, dotazníky, scoring, nálezy, doporučení, roadmapu, NIS2 gap analýzu a exporty do PDF, XLSX a JSON.

## Použité technologie

- Next.js App Router, React, TypeScript
- Tailwind CSS, Recharts, lucide-react
- PostgreSQL, Prisma ORM
- NextAuth credentials login
- bcryptjs pro hashování hesel
- jsPDF a ExcelJS pro exporty

## Požadavky

- Node.js 20+
- PostgreSQL 14+
- npm/pnpm/yarn podle vašeho prostředí

## Instalace

```bash
npm install
cp .env.example .env
```

V `.env` nastavte minimálně:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/it_audit?schema=public"
NEXTAUTH_SECRET="change-this-secret"
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
UPLOAD_DIR="./uploads"
PDF_EXPORT_DIR="./exports"
```

## Migrace databáze

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Pokud chcete rychle vytvořit lokální schéma bez migrace:

```bash
npx prisma db push
```

## Seed dat

```bash
npm run prisma:seed
```

Seed vloží demo uživatele, demo organizaci, demo audit, 18 auditních oblastí, přes 250 otázek, NIS2 framework, 12 NIS2 požadavků, mapování otázek, ukázkové odpovědi, nálezy, doporučení, roadmapu, evidence a reporty.

## Spuštění vývoje

```bash
npm run dev
```

Aplikace poběží na `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Demo přístupy

- Admin: `admin@example.com` / `ChangeMe123!`
- Auditor: `auditor@example.com` / `ChangeMe123!`
- Viewer: `viewer@example.com` / `ChangeMe123!`

## Základní workflow auditu

1. Přihlaste se jako admin nebo auditor.
2. Otevřete `/dashboard` a vyberte demo audit.
3. V `/audits/[id]/questionnaire` upravujte odpovědi.
4. Odpovědi `Ne`, `Spíše ne` a `Nevím` automaticky vytvářejí nález.
5. V `/audits/[id]` sledujte IT maturity score, cybersecurity maturity score a NIS2 readiness score.
6. V `/audits/[id]/nis2` zkontrolujte NIS2 gap analýzu a mapování požadavků.
7. V `/audits/[id]/roadmap` sledujte opatření 30/90/180/365 dní.
8. V `/audits/[id]/report` exportujte PDF, XLSX nebo JSON.

## CSV import

API endpointy pro import:

- `POST /api/import/organizations` s polem `file`
- `POST /api/import/questions` s poli `file` a `sectionId`
- `POST /api/import/answers` s poli `file` a `auditId`

CSV používá první řádek jako hlavičku. Pro odpovědi použijte sloupce `questionId` nebo `questionCode`, `answer`, `comment`.

## Hlavní stránky

- `/embed/clarityx`
- `/register`
- `/self-audit`
- `/login`
- `/dashboard`
- `/organizations`
- `/organizations/[id]`
- `/audits`
- `/audits/new`
- `/audits/[id]`
- `/audits/[id]/questionnaire`
- `/audits/[id]/findings`
- `/audits/[id]/findings/[findingId]`
- `/audits/[id]/roadmap`
- `/audits/[id]/nis2`
- `/audits/[id]/report`
- `/settings/templates`
- `/settings/users`

## Vložení do webu ClarityX

Nejjednodušší varianta je odkaz nebo tlačítko:

```html
<a href="https://audit.clarityx.cz/embed/clarityx">Spustit IT audit</a>
```

Pokud chcete vložit auditní vstup přímo do stránky:

```html
<iframe
  src="https://audit.clarityx.cz/embed/clarityx"
  title="ClarityX IT & Cyber Audit"
  style="width:100%;height:720px;border:0;"
></iframe>
```

Tok pro klienta: `/embed/clarityx` → registrace nebo přihlášení → `/self-audit` → založení organizace a auditu → dotazník.

## NIS2 upozornění

NIS2 report obsahuje disclaimer:

> Tento report představuje technické a organizační posouzení připravenosti na NIS2 a nový zákon o kybernetické bezpečnosti. Nenahrazuje právní stanovisko ani formální rozhodnutí příslušného orgánu. Posouzení působnosti a konkrétních právních povinností musí být ověřeno podle aktuální legislativy a metodiky NÚKIB.

## Připravenost na AI rozšíření

V `services/ai-ready.ts` jsou připravené funkce:

- `generateExecutiveSummary(auditId)`
- `generateFindingsFromAnswers(auditId)`
- `generateRoadmap(auditId)`
- `generateTechnicalReport(auditId)`
- `compareAudits(auditId1, auditId2)`

První verze je pravidlová. Později lze stejná rozhraní napojit na AI asistenta, import dokumentace, Microsoft 365, Intune, Defender, Active Directory, Power BI nebo SAP B1.

## Deployment

1. Připravte PostgreSQL databázi.
2. Nastavte produkční `.env`.
3. Spusťte `npm run build`.
4. Proveďte migrace přes `npx prisma migrate deploy`.
5. Spusťte aplikaci přes `npm run start` nebo ji nasaďte na platformu podporující Next.js.
