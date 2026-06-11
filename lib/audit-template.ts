import type { Priority } from "@prisma/client";

export type TemplateQuestion = {
  text: string;
  weight?: number;
  evidenceRequired?: boolean;
  recommendation?: string;
  risk?: string;
  nis2?: {
    code: string;
    article: string;
    category: string;
    strength?: "PRIMARY" | "SECONDARY" | "SUPPORTING";
    impact?: "BLOCKS_COMPLIANCE" | "WEAKENS_COMPLIANCE" | "EVIDENCE_MISSING" | "IMPROVEMENT_ONLY";
    recommendation: string;
  };
};

export type TemplateSection = {
  code: string;
  title: string;
  description: string;
  weight: number;
  questions: TemplateQuestion[];
};

type Nis2Mapping = NonNullable<TemplateQuestion["nis2"]>;

const q = (text: string, weight = 3, nis2?: Nis2Mapping, evidenceRequired = false): TemplateQuestion => ({
  text,
  weight,
  nis2,
  evidenceRequired: evidenceRequired || Boolean(nis2),
  recommendation: nis2?.recommendation ?? `Doplnit kontrolu: ${text}`,
  risk: `Chybějící nebo nedostatečná kontrola zvyšuje provozní a bezpečnostní riziko v oblasti: ${text}`
});

const n = (
  code: string,
  article: string,
  category: string,
  recommendation: string,
  impact: Nis2Mapping["impact"] = "WEAKENS_COMPLIANCE",
  strength: Nis2Mapping["strength"] = "PRIMARY"
) => ({ code, article, category, recommendation, impact, strength });

export const nis2Requirements = [
  {
    code: "NIS2-01",
    title: "Governance a odpovědnost vedení",
    description: "Vedení schvaluje, dohlíží a pravidelně vyhodnocuje opatření kybernetické bezpečnosti.",
    article: "Article 20",
    category: "Governance",
    requirementType: "Organizační opatření",
    weight: 5,
    evidence: ["zápis z porady vedení", "bezpečnostní report", "schválený rozpočet", "školení vedení"],
    actions: ["určit vlastníka kyberbezpečnosti", "zavést report vedení", "schvalovat bezpečnostní opatření"]
  },
  {
    code: "NIS2-02",
    title: "Politiky řízení rizik a bezpečnosti informací",
    description: "Organizace má politiku bezpečnosti informací, risk register a proces pravidelného řízení rizik.",
    article: "Article 21(2)(a)",
    category: "Risk management policies",
    requirementType: "Organizační opatření",
    weight: 5,
    evidence: ["bezpečnostní politika", "risk register", "zápisy z revize rizik"],
    actions: ["vytvořit risk register", "schválit bezpečnostní politiku", "reportovat rizika vedení"]
  },
  {
    code: "NIS2-03",
    title: "Incident handling",
    description: "Organizace má proces detekce, evidence, eskalace a zvládání bezpečnostních incidentů.",
    article: "Article 21(2)(b)",
    category: "Incident handling",
    requirementType: "Organizační a technické opatření",
    weight: 5,
    evidence: ["incident response plán", "evidence incidentů", "eskalační matice"],
    actions: ["vytvořit IR plán", "definovat role", "provést tabletop cvičení"]
  },
  {
    code: "NIS2-04",
    title: "Business continuity, backup, DR a crisis management",
    description: "Organizace chrání kontinuitu provozu, zálohy, obnovu a krizové řízení.",
    article: "Article 21(2)(c)",
    category: "Business continuity",
    requirementType: "Organizační a technické opatření",
    weight: 5,
    evidence: ["BCP plán", "DR plán", "test obnovy", "zálohovací politika"],
    actions: ["definovat RTO/RPO", "testovat obnovu", "zavést immutable zálohy"]
  },
  {
    code: "NIS2-05",
    title: "Supply chain security",
    description: "Dodavatelé a třetí strany jsou posuzováni a smluvně řízeni z pohledu bezpečnosti.",
    article: "Article 21(2)(d)",
    category: "Supply chain security",
    requirementType: "Organizační opatření",
    weight: 4,
    evidence: ["seznam dodavatelů", "smlouvy", "SLA", "hodnocení dodavatelů"],
    actions: ["zavést hodnocení dodavatelů", "doplnit smluvní požadavky", "revidovat přístupy"]
  },
  {
    code: "NIS2-06",
    title: "Security in acquisition, development and maintenance",
    description: "Bezpečnost je součástí nákupu, změn, vývoje, údržby a vulnerability managementu.",
    article: "Article 21(2)(e)",
    category: "Secure acquisition and development",
    requirementType: "Technické a procesní opatření",
    weight: 4,
    evidence: ["change proces", "vulnerability scan", "code review", "patch report"],
    actions: ["zavést vulnerability management", "bezpečnostní review změn", "kontrolovat závislosti"]
  },
  {
    code: "NIS2-07",
    title: "Effectiveness assessment",
    description: "Účinnost bezpečnostních opatření je pravidelně měřena, testována a reportována.",
    article: "Article 21(2)(f)",
    category: "Effectiveness assessment",
    requirementType: "Organizační opatření",
    weight: 3,
    evidence: ["bezpečnostní KPI", "auditní plán", "reporty opatření"],
    actions: ["zavést KPI", "provádět interní audity", "vyhodnocovat opatření"]
  },
  {
    code: "NIS2-08",
    title: "Cyber hygiene a školení",
    description: "Organizace uplatňuje základní bezpečnostní hygienu a pravidelné školení zaměstnanců.",
    article: "Article 21(2)(g)",
    category: "Cyber hygiene and training",
    requirementType: "Organizační opatření",
    weight: 4,
    evidence: ["školení", "phishing simulace", "bezpečnostní směrnice"],
    actions: ["školit zaměstnance", "provádět simulace phishingu", "evidovat účast"]
  },
  {
    code: "NIS2-09",
    title: "Cryptography and encryption",
    description: "Šifrování a kryptografie jsou řízeny politikou a uplatňovány podle citlivosti dat.",
    article: "Article 21(2)(h)",
    category: "Cryptography and encryption",
    requirementType: "Technické opatření",
    weight: 4,
    evidence: ["politika šifrování", "BitLocker report", "TLS konfigurace"],
    actions: ["šifrovat zařízení", "spravovat klíče", "zakázat slabé protokoly"]
  },
  {
    code: "NIS2-10",
    title: "HR security, access control and asset management",
    description: "Organizace řídí životní cyklus identit, přístupová práva a evidenci aktiv.",
    article: "Article 21(2)(i)",
    category: "Access control and asset management",
    requirementType: "Organizační a technické opatření",
    weight: 5,
    evidence: ["přístupová matice", "evidence aktiv", "revize oprávnění"],
    actions: ["zavést access review", "evidovat aktiva", "omezit privilegovaná oprávnění"]
  },
  {
    code: "NIS2-11",
    title: "MFA and secure communications",
    description: "MFA, bezpečná komunikace a nouzové komunikační kanály chrání kritické přístupy.",
    article: "Article 21(2)(j)",
    category: "MFA and secure communications",
    requirementType: "Technické opatření",
    weight: 5,
    evidence: ["export MFA", "Conditional Access policies", "nouzový komunikační plán"],
    actions: ["zapnout MFA", "blokovat legacy auth", "zavést bezpečný incident kanál"]
  },
  {
    code: "NIS2-12",
    title: "Reporting obligations",
    description: "Organizace umí vyhodnotit a včas hlásit významné incidenty příslušnému orgánu.",
    article: "NIS2 incident reporting obligations",
    category: "Reporting obligations",
    requirementType: "Organizační opatření",
    weight: 4,
    evidence: ["postup hlášení", "šablona hlášení", "evidence incidentů"],
    actions: ["definovat lhůty", "určit odpovědné osoby", "zapojit právní/DPO roli"]
  }
] as const;

export const auditSections: TemplateSection[] = [
  {
    code: "GOV",
    title: "IT Governance a řízení IT",
    description: "Řízení IT, strategie, reporting, rozpočty, dodavatelé a odpovědnosti.",
    weight: 5,
    questions: [
      q("Existuje formálně definovaná IT strategie?", 3),
      q("Existuje IT rozpočet?", 3),
      q("Jsou definovány odpovědnosti za IT?", 4, n("NIS2-01", "Article 20", "Governance", "Definovat odpovědnosti za IT a kyberbezpečnost.")),
      q("Existuje katalog IT služeb?"),
      q("Jsou IT služby měřeny pomocí KPI?", 3, n("NIS2-07", "Article 21(2)(f)", "Effectiveness assessment", "Zavést KPI pro IT a bezpečnost.")),
      q("Existuje pravidelný reporting IT vedení?", 4, n("NIS2-01", "Article 20", "Governance", "Zavést pravidelný report kybernetických rizik pro vedení.")),
      q("Jsou definovány zásady pro nákup IT?", 3, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Doplnit bezpečnostní požadavky do nákupu IT.")),
      q("Existuje řízení dodavatelů IT?", 4, n("NIS2-05", "Article 21(2)(d)", "Supply chain security", "Zavést proces bezpečnostního řízení dodavatelů.")),
      q("Jsou smlouvy s dodavateli pravidelně vyhodnocovány?", 3, n("NIS2-05", "Article 21(2)(d)", "Supply chain security", "Pravidelně vyhodnocovat bezpečnostní závazky dodavatelů.")),
      q("Existuje evidence IT projektů?"),
      q("Jsou IT projekty prioritizovány podle hodnoty pro firmu?"),
      q("Existuje řízení změn v IT?", 4, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Zavést řízení změn s bezpečnostním posouzením.")),
      q("Jsou IT rizika pravidelně vyhodnocována?", 5, n("NIS2-02", "Article 21(2)(a)", "Risk management policies", "Zavést pravidelné hodnocení IT a kybernetických rizik.")),
      q("Má firma definovanou odpovědnou osobu za kyberbezpečnost?", 5, n("NIS2-01", "Article 20", "Governance", "Určit vlastníka kyberbezpečnosti.", "BLOCKS_COMPLIANCE")),
      q("Existují pravidelné IT porady nebo governance meetingy?", 3, n("NIS2-01", "Article 20", "Governance", "Zavést pravidelné governance meetingy."))
    ]
  },
  {
    code: "DOC",
    title: "IT dokumentace",
    description: "Technická a provozní dokumentace IT prostředí.",
    weight: 3,
    questions: [
      q("Existuje aktuální dokumentace IT infrastruktury?"), q("Existuje síťové schéma?", 4, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Doplnit síťové schéma jako důkaz o prostředí.")), q("Existuje seznam serverů?"), q("Existuje seznam aplikací?"), q("Existuje seznam databází?"), q("Existuje seznam kritických systémů?", 5, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Evidovat kritické systémy a jejich vlastníky.", "BLOCKS_COMPLIANCE")), q("Existuje evidence licencí?"), q("Existuje evidence uživatelů a oprávnění?", 4, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Vést evidenci uživatelů a oprávnění.")), q("Existuje dokumentace zálohování?", 4, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Doplnit dokumentaci zálohování.")), q("Existuje dokumentace obnovy po havárii?", 4, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Doplnit DR dokumentaci.")), q("Existuje dokumentace správy firewallů?"), q("Existuje dokumentace VPN přístupů?"), q("Existuje dokumentace cloudových služeb?"), q("Existuje evidence servisních účtů?", 4, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Evidovat servisní účty.")), q("Je dokumentace pravidelně aktualizována?")
    ]
  },
  {
    code: "AST",
    title: "Asset management",
    description: "Evidence a životní cyklus hardwaru, softwaru, licencí a zařízení.",
    weight: 4,
    questions: [
      q("Existuje centrální evidence HW?", 5, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Zavést centrální evidenci HW.")), q("Existuje centrální evidence SW?", 5, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Zavést centrální evidenci SW.")), q("Jsou evidována koncová zařízení?"), q("Jsou evidovány servery?"), q("Jsou evidovány síťové prvky?"), q("Jsou evidována mobilní zařízení?"), q("Je evidován vlastník každého zařízení?", 4, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Každé aktivum musí mít vlastníka.")), q("Je evidováno stáří zařízení?"), q("Je evidován stav zařízení?"), q("Existuje životní cyklus zařízení?"), q("Existuje proces vyřazení zařízení?"), q("Jsou zařízení při vyřazení bezpečně mazána?", 4, n("NIS2-09", "Article 21(2)(h)", "Cryptography and encryption", "Doplnit bezpečné mazání a ochranu dat při vyřazení.")), q("Jsou evidovány záruky?"), q("Jsou evidovány licence?"), q("Probíhá pravidelná inventura?")
    ]
  },
  {
    code: "IAM",
    title: "Identity & Access Management",
    description: "Identity, účty, oprávnění, MFA a privilegované přístupy.",
    weight: 5,
    questions: [
      q("Existuje centrální správa identit?", 4, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Zavést centrální správu identit.")), q("Používá se Active Directory, Entra ID nebo jiný identity provider?"), q("Existuje proces založení uživatele?", 4, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Formalizovat proces nástupu uživatele.")), q("Existuje proces změny role uživatele?", 4, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Formalizovat změny rolí.")), q("Existuje proces zrušení uživatele?", 5, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Formalizovat offboarding uživatelů.")), q("Jsou účty rušeny při odchodu zaměstnance?", 5, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Rušit účty při odchodu zaměstnance.", "BLOCKS_COMPLIANCE")), q("Jsou přístupy pravidelně revidovány?", 5, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Zavést pravidelné access review.")), q("Je používáno MFA?", 5, n("NIS2-11", "Article 21(2)(j)", "MFA and secure communications", "Zavést MFA pro klíčové přístupy.")), q("Je MFA povinné pro administrátory?", 5, n("NIS2-11", "Article 21(2)(j)", "MFA and secure communications", "Zavést povinné MFA pro všechny administrátorské účty, ideálně phishing-resistant metodou.", "BLOCKS_COMPLIANCE")), q("Je MFA povinné pro vzdálené přístupy?", 5, n("NIS2-11", "Article 21(2)(j)", "MFA and secure communications", "Zavést MFA pro VPN a vzdálené přístupy.", "BLOCKS_COMPLIANCE")), q("Existují sdílené účty?"), q("Existují privilegované účty?", 4, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Evidovat a pravidelně kontrolovat privilegované účty.")), q("Jsou administrátorská oprávnění oddělena od běžných účtů?", 5, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Oddělit administrátorské a běžné účty.")), q("Jsou servisní účty evidovány?"), q("Mají servisní účty omezená oprávnění?"), q("Jsou hesla spravována bezpečně?"), q("Existuje password policy?", 3, n("NIS2-08", "Article 21(2)(g)", "Cyber hygiene and training", "Zavést pravidla pro hesla.")), q("Jsou zakázána slabá hesla?"), q("Je nastaven lockout policy?"), q("Existuje řízení externích účtů?", 4, n("NIS2-05", "Article 21(2)(d)", "Supply chain security", "Řídit externí a dodavatelské účty."))
    ]
  },
  {
    code: "END",
    title: "Endpoint security",
    description: "Správa a ochrana koncových zařízení.",
    weight: 5,
    questions: [
      q("Jsou všechna koncová zařízení spravována centrálně?"), q("Používá firma MDM nebo Intune?"), q("Je nasazen antivirus nebo EDR?", 5), q("Je bezpečnostní řešení centrálně monitorováno?"), q("Jsou zapnuté aktualizace OS?", 5, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Zajistit pravidelné aktualizace koncových zařízení.")), q("Jsou aktualizace pravidelně kontrolovány?"), q("Jsou zařízení šifrována?", 5, n("NIS2-09", "Article 21(2)(h)", "Cryptography and encryption", "Šifrovat notebooky a mobilní zařízení.")), q("Je používán BitLocker nebo FileVault?", 4, n("NIS2-09", "Article 21(2)(h)", "Cryptography and encryption", "Zavést BitLocker nebo FileVault.")), q("Jsou lokální administrátorská práva omezena?", 5, n("NIS2-10", "Article 21(2)(i)", "Access control and asset management", "Omezit lokální administrátorská práva.")), q("Je řízeno připojování USB zařízení?"), q("Je nastaven firewall na koncových zařízeních?"), q("Je nastaven screen lock?"), q("Je řízen přístup z osobních zařízení?"), q("Existuje BYOD politika?", 3, n("NIS2-08", "Article 21(2)(g)", "Cyber hygiene and training", "Definovat pravidla BYOD.")), q("Jsou notebooky chráněny při ztrátě nebo krádeži?")
    ]
  },
  {
    code: "SRV",
    title: "Server security",
    description: "Bezpečnost serverů, hardening, monitoring, zálohování a obnova.",
    weight: 5,
    questions: [
      q("Existuje seznam serverů?"), q("Jsou servery pravidelně aktualizovány?", 5, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Zavést patch management serverů.")), q("Jsou servery monitorovány?"), q("Jsou servery chráněny EDR/antivirem?"), q("Jsou administrátorské přístupy omezeny?"), q("Je používán princip nejnižších oprávnění?"), q("Jsou servery segmentovány?"), q("Jsou logy ze serverů centrálně ukládány?", 4), q("Jsou zbytečné služby vypnuté?"), q("Jsou servery pravidelně zálohovány?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Zálohovat servery podle kritičnosti.")), q("Existuje plán obnovy serverů?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Doplnit plán obnovy serverů.")), q("Jsou testovány obnovy serverů?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Pravidelně testovat obnovu serverů.", "BLOCKS_COMPLIANCE")), q("Jsou produkční a testovací servery oddělené?"), q("Jsou kritické servery chráněny proti ransomware?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Chránit kritické servery proti ransomware.")), q("Existuje hardening standard?")
    ]
  },
  {
    code: "NET",
    title: "Síťová bezpečnost",
    description: "Segmentace sítě, firewall, VPN, Wi-Fi a síťové prvky.",
    weight: 5,
    questions: [
      q("Existuje aktuální síťové schéma?"), q("Je síť segmentována?", 5), q("Jsou odděleny servery, uživatelé, hosté a výroba?", 5), q("Je používán firewall mezi segmenty?"), q("Existují VLAN?"), q("Je řízen přístup do Wi-Fi?"), q("Existuje samostatná guest Wi-Fi?"), q("Je Wi-Fi šifrovaná pomocí WPA2/WPA3?", 4, n("NIS2-09", "Article 21(2)(h)", "Cryptography and encryption", "Používat bezpečné šifrování Wi-Fi.")), q("Jsou síťové prvky pravidelně aktualizovány?", 4, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Aktualizovat síťové prvky.")), q("Jsou síťové prvky centrálně spravovány?"), q("Jsou výchozí hesla změněna?"), q("Jsou administrátorské přístupy omezeny?"), q("Je používána VPN?"), q("Je VPN chráněna MFA?", 5, n("NIS2-11", "Article 21(2)(j)", "MFA and secure communications", "Chránit VPN vícefaktorovým ověřením.", "BLOCKS_COMPLIANCE")), q("Jsou logy z firewallu vyhodnocovány?"), q("Existuje IDS/IPS?"), q("Je řízen přístup z internetu do interní sítě?"), q("Jsou otevřené porty pravidelně kontrolovány?")
    ]
  },
  {
    code: "CLD",
    title: "Cloud a Microsoft 365",
    description: "Bezpečnost cloudových služeb, Microsoft 365 a spolupráce.",
    weight: 5,
    questions: [
      q("Používá firma Microsoft 365 nebo jiné cloudové služby?"), q("Je zapnuté MFA pro všechny uživatele?", 5, n("NIS2-11", "Article 21(2)(j)", "MFA and secure communications", "Zapnout MFA pro cloudové služby.")), q("Jsou administrátorské účty oddělené?"), q("Je omezen počet globálních administrátorů?"), q("Jsou nastavena pravidla Conditional Access?", 5, n("NIS2-11", "Article 21(2)(j)", "MFA and secure communications", "Nastavit Conditional Access pro rizikové přístupy.")), q("Jsou blokovány legacy authentication protokoly?", 5, n("NIS2-11", "Article 21(2)(j)", "MFA and secure communications", "Blokovat legacy authentication protokoly.", "BLOCKS_COMPLIANCE")), q("Je nastaven audit log?"), q("Jsou logy uchovávány dostatečně dlouho?"), q("Je chráněn Exchange Online?"), q("Je nastavena ochrana proti phishingu?"), q("Je nastavena ochrana proti spoofingu?"), q("Jsou používány SPF, DKIM a DMARC?"), q("Je nastavena DLP politika?"), q("Je řízeno sdílení v OneDrive a SharePointu?"), q("Je řízeno externí sdílení?"), q("Je používán Defender for Office 365 nebo obdobné řešení?"), q("Jsou pravidelně kontrolována oprávnění v Teams?"), q("Existuje záloha Microsoft 365 dat?", 4, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Zálohovat kritická Microsoft 365 data."))
    ]
  },
  {
    code: "BCK",
    title: "Zálohování a obnova",
    description: "Zálohovací strategie, ochrana záloh a testování obnovy.",
    weight: 5,
    questions: [
      q("Existuje zálohovací strategie?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Vytvořit zálohovací strategii.", "BLOCKS_COMPLIANCE")), q("Jsou definována RPO a RTO?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Definovat RPO a RTO.")), q("Jsou zálohována kritická data?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Zálohovat kritická data.")), q("Jsou zálohovány servery?"), q("Jsou zálohovány databáze?"), q("Jsou zálohovány cloudové služby?"), q("Jsou zálohy šifrovány?", 4, n("NIS2-09", "Article 21(2)(h)", "Cryptography and encryption", "Šifrovat zálohy.")), q("Jsou zálohy oddělené od produkčního prostředí?"), q("Existují offline nebo immutable zálohy?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Zavést offline nebo immutable zálohy.", "BLOCKS_COMPLIANCE")), q("Jsou zálohy chráněny proti ransomware?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Chránit zálohy proti ransomware.")), q("Jsou obnovy pravidelně testovány?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Pravidelně testovat obnovu.", "BLOCKS_COMPLIANCE")), q("Existuje dokumentovaný plán obnovy?"), q("Jsou výsledky testů obnovy evidovány?"), q("Je jasné, kdo obnovu provádí?"), q("Je jasné, v jakém pořadí se obnovují systémy?")
    ]
  },
  {
    code: "DRB",
    title: "Disaster Recovery a Business Continuity",
    description: "Plány kontinuity, krizové řízení a komunikační postupy.",
    weight: 5,
    questions: [
      q("Existuje disaster recovery plán?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Vytvořit DR plán.", "BLOCKS_COMPLIANCE")), q("Existuje business continuity plán?", 5, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Vytvořit BCP plán.")), q("Jsou definovány kritické procesy?"), q("Jsou definovány kritické aplikace?"), q("Je známo, jak dlouho může být firma bez jednotlivých systémů?"), q("Existuje krizový tým?", 4, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Definovat krizový tým.")), q("Jsou definované kontakty pro incident?"), q("Jsou definované náhradní postupy?"), q("Je plán pravidelně testován?", 4, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Testovat DR/BCP plány.")), q("Je plán pravidelně aktualizován?"), q("Jsou zaměstnanci seznámeni s postupy při výpadku?"), q("Existuje komunikační plán pro incident?", 4, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Doplnit komunikační plán incidentu.")), q("Existuje plán pro ransomware incident?", 5, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Vytvořit postup pro ransomware incident.", "BLOCKS_COMPLIANCE")), q("Existuje plán pro výpadek internetu?"), q("Existuje plán pro výpadek hlavního serveru nebo cloudu?")
    ]
  },
  {
    code: "MON",
    title: "Monitoring, logování a detekce",
    description: "Sběr logů, monitoring, alerting a detekce bezpečnostních událostí.",
    weight: 5,
    questions: [
      q("Jsou logy centrálně sbírány?", 5), q("Jsou logy pravidelně vyhodnocovány?", 4, n("NIS2-07", "Article 21(2)(f)", "Effectiveness assessment", "Pravidelně vyhodnocovat bezpečnostní logy.")), q("Existuje SIEM nebo log management?"), q("Jsou monitorovány servery?"), q("Jsou monitorovány síťové prvky?"), q("Jsou monitorovány bezpečnostní události?", 5, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Monitorovat bezpečnostní události pro detekci incidentů.")), q("Jsou monitorovány administrátorské aktivity?"), q("Jsou monitorovány neúspěšné přihlášení?"), q("Jsou monitorovány změny oprávnění?"), q("Jsou monitorovány změny konfigurací?"), q("Existují alerty na kritické události?"), q("Existuje proces řešení alertů?", 4, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Definovat proces řešení alertů.")), q("Jsou definovány odpovědné osoby?"), q("Jsou logy chráněny proti změně?"), q("Je nastavena dostatečná retenční doba logů?")
    ]
  },
  {
    code: "VUL",
    title: "Vulnerability management",
    description: "Skenování, evidence, prioritizace a oprava zranitelností.",
    weight: 5,
    questions: [
      q("Probíhá pravidelné skenování zranitelností?", 5, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Zavést pravidelné skenování zranitelností.")), q("Jsou skenovány servery?"), q("Jsou skenována koncová zařízení?"), q("Jsou skenovány externí IP adresy?"), q("Jsou skenovány webové aplikace?"), q("Existuje evidence zranitelností?", 5, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Vést evidenci zranitelností.")), q("Jsou zranitelnosti prioritizovány?", 5, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Prioritizovat zranitelnosti podle rizika.")), q("Jsou kritické zranitelnosti řešeny v definovaném čase?", 5, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Definovat SLA pro kritické zranitelnosti.", "BLOCKS_COMPLIANCE")), q("Existuje patch management proces?", 5, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Zavést patch management.")), q("Jsou aplikace pravidelně aktualizovány?"), q("Jsou síťové prvky aktualizovány?"), q("Jsou zranitelnosti reportovány vedení?", 3, n("NIS2-01", "Article 20", "Governance", "Reportovat významné zranitelnosti vedení.")), q("Je prováděn penetrační test?"), q("Jsou výsledky penetračních testů řešeny?"), q("Existuje výjimkový proces pro neopravené zranitelnosti?")
    ]
  },
  {
    code: "INC",
    title: "Incident response",
    description: "Připravenost na incidenty, eskalace, komunikace a poučení.",
    weight: 5,
    questions: [
      q("Existuje incident response plán?", 5, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Vytvořit incident response plán včetně rolí, eskalace a postupů.", "BLOCKS_COMPLIANCE")), q("Jsou definované typy bezpečnostních incidentů?", 4, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Definovat typy bezpečnostních incidentů.")), q("Jsou definované role při incidentu?", 4, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Definovat role při incidentu.")), q("Existuje postup pro ransomware incident?", 5, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Vytvořit postup pro ransomware incident.", "BLOCKS_COMPLIANCE")), q("Existuje postup pro únik dat?", 5, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Vytvořit postup pro únik dat.")), q("Existuje postup pro kompromitaci účtu?", 4, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Vytvořit postup pro kompromitaci účtu.")), q("Existuje postup pro phishing?"), q("Existuje kontakt na externí podporu?"), q("Jsou incidenty evidovány?", 4, n("NIS2-12", "NIS2 incident reporting obligations", "Reporting obligations", "Evidovat incidenty pro zpětné doložení.")), q("Jsou incidenty vyhodnocovány?", 4, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Vyhodnocovat incidenty a lessons learned.")), q("Probíhá poučení po incidentu?"), q("Existuje komunikační plán?"), q("Je jasné, kdo komunikuje s vedením?"), q("Je jasné, kdo komunikuje se zákazníky?"), q("Je jasné, kdy se zapojuje právník nebo DPO?", 4, n("NIS2-12", "NIS2 incident reporting obligations", "Reporting obligations", "Definovat zapojení právníka, DPO nebo compliance osoby."))
    ]
  },
  {
    code: "PHY",
    title: "Fyzická bezpečnost",
    description: "Fyzická ochrana serveroven, médií, zařízení a návštěv.",
    weight: 3,
    questions: [
      q("Jsou serverovny fyzicky zabezpečené?"), q("Je přístup do serverovny omezený?"), q("Je přístup do serverovny evidovaný?"), q("Je serverovna monitorovaná?"), q("Existuje klimatizace serverovny?"), q("Existuje UPS?"), q("Je UPS pravidelně testovaná?"), q("Existuje protipožární ochrana?"), q("Jsou síťové rozvaděče zabezpečené?"), q("Jsou záložní média fyzicky chráněná?", 4, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Fyzicky chránit záložní média.")), q("Je řízen přístup externích osob?"), q("Jsou návštěvy evidovány?"), q("Jsou notebooky a zařízení chráněny proti krádeži?"), q("Existuje politika čistého stolu?"), q("Existuje bezpečná likvidace dokumentů a médií?")
    ]
  },
  {
    code: "APP",
    title: "Aplikační bezpečnost",
    description: "Bezpečný vývoj, provoz aplikací, API a zranitelné knihovny.",
    weight: 4,
    questions: [
      q("Vyvíjí firma vlastní aplikace?"), q("Existuje bezpečnostní review aplikací?", 4, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Provádět bezpečnostní review aplikací.")), q("Jsou aplikace testovány na zranitelnosti?", 4, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Testovat aplikace na zranitelnosti.")), q("Jsou webové aplikace chráněny proti běžným útokům?"), q("Je používán WAF?"), q("Jsou přístupy do aplikací řízeny centrálně?"), q("Jsou aplikace pravidelně aktualizovány?", 4, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Aktualizovat aplikace.")), q("Jsou testovací a produkční prostředí oddělena?"), q("Jsou tajné klíče a hesla ukládány bezpečně?", 5, n("NIS2-09", "Article 21(2)(h)", "Cryptography and encryption", "Bezpečně spravovat tajné klíče a hesla.")), q("Jsou API chráněna autentizací?"), q("Jsou API rate-limitována?"), q("Jsou logovány bezpečnostní události aplikací?"), q("Existuje proces nasazování změn?", 4, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Zavést řízené nasazování změn.")), q("Existuje code review?", 4, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Provádět code review.")), q("Existuje správa zranitelných knihoven?", 4, n("NIS2-06", "Article 21(2)(e)", "Secure acquisition and development", "Kontrolovat zranitelnosti knihoven."))
    ]
  },
  {
    code: "DAT",
    title: "Data protection a GDPR",
    description: "Ochrana citlivých a osobních dat, klasifikace a retence.",
    weight: 4,
    questions: [
      q("Jsou identifikována citlivá data?"), q("Jsou identifikována osobní data?"), q("Existuje klasifikace dat?"), q("Jsou data chráněna podle citlivosti?"), q("Jsou data šifrována při přenosu?", 4, n("NIS2-09", "Article 21(2)(h)", "Cryptography and encryption", "Šifrovat citlivá data při přenosu.")), q("Jsou data šifrována při uložení?", 4, n("NIS2-09", "Article 21(2)(h)", "Cryptography and encryption", "Šifrovat citlivá data při uložení.")), q("Je řízen přístup k osobním údajům?"), q("Jsou osobní údaje pravidelně mazány dle retenčních pravidel?"), q("Existuje evidence zpracování osobních údajů?"), q("Existuje postup pro únik osobních údajů?", 4, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Doplnit postup pro únik osobních údajů.")), q("Je definována role DPO nebo odpovědná osoba?"), q("Jsou dodavatelé posuzováni z hlediska ochrany dat?"), q("Existují smlouvy o zpracování osobních údajů?"), q("Jsou zaměstnanci školeni v ochraně dat?"), q("Je řízen export dat mimo firmu?")
    ]
  },
  {
    code: "AWR",
    title: "Security awareness",
    description: "Školení, phishing, směrnice a bezpečnostní kultura.",
    weight: 4,
    questions: [
      q("Probíhá školení kyberbezpečnosti?", 4, n("NIS2-08", "Article 21(2)(g)", "Cyber hygiene and training", "Zavést pravidelné školení kyberbezpečnosti.")), q("Probíhá školení při nástupu zaměstnance?", 3, n("NIS2-08", "Article 21(2)(g)", "Cyber hygiene and training", "Školit zaměstnance při nástupu.")), q("Probíhá pravidelné opakování školení?", 3, n("NIS2-08", "Article 21(2)(g)", "Cyber hygiene and training", "Opakovat školení pravidelně.")), q("Jsou zaměstnanci školeni proti phishingu?", 4, n("NIS2-08", "Article 21(2)(g)", "Cyber hygiene and training", "Školit proti phishingu.")), q("Probíhají phishingové simulace?", 3, n("NIS2-08", "Article 21(2)(g)", "Cyber hygiene and training", "Provádět phishingové simulace.")), q("Existují bezpečnostní směrnice?", 4, n("NIS2-02", "Article 21(2)(a)", "Risk management policies", "Vytvořit bezpečnostní směrnice.")), q("Jsou zaměstnanci se směrnicemi seznámeni?"), q("Vědí zaměstnanci, kam hlásit incident?", 4, n("NIS2-03", "Article 21(2)(b)", "Incident handling", "Informovat zaměstnance, kam hlásit incident.")), q("Vědí zaměstnanci, jak poznat phishing?"), q("Existují pravidla pro hesla?", 3, n("NIS2-08", "Article 21(2)(g)", "Cyber hygiene and training", "Definovat pravidla pro hesla.")), q("Existují pravidla pro práci mimo kancelář?", 3, n("NIS2-08", "Article 21(2)(g)", "Cyber hygiene and training", "Definovat pravidla pro práci mimo kancelář.")), q("Existují pravidla pro práci s citlivými daty?", 3, n("NIS2-08", "Article 21(2)(g)", "Cyber hygiene and training", "Definovat pravidla pro práci s citlivými daty.")), q("Existují pravidla pro používání soukromých zařízení?", 3, n("NIS2-08", "Article 21(2)(g)", "Cyber hygiene and training", "Definovat pravidla pro soukromá zařízení.")), q("Je bezpečnost podporována vedením?", 4, n("NIS2-01", "Article 20", "Governance", "Zajistit podporu bezpečnosti vedením.")), q("Měří se účinnost školení?", 3, n("NIS2-07", "Article 21(2)(f)", "Effectiveness assessment", "Měřit účinnost školení."))
    ]
  },
  {
    code: "SUP",
    title: "Dodavatelé a třetí strany",
    description: "Bezpečnost dodavatelů, SLA, přístupy, exit plán a cloud.",
    weight: 4,
    questions: [
      q("Existuje seznam IT dodavatelů?", 4, n("NIS2-05", "Article 21(2)(d)", "Supply chain security", "Vést seznam IT dodavatelů.")), q("Jsou dodavatelé bezpečnostně posuzováni?", 5, n("NIS2-05", "Article 21(2)(d)", "Supply chain security", "Bezpečnostně posuzovat dodavatele.", "BLOCKS_COMPLIANCE")), q("Jsou ve smlouvách bezpečnostní požadavky?", 5, n("NIS2-05", "Article 21(2)(d)", "Supply chain security", "Doplnit bezpečnostní požadavky do smluv.")), q("Jsou ve smlouvách SLA?", 3, n("NIS2-05", "Article 21(2)(d)", "Supply chain security", "Doplnit SLA do smluv.")), q("Jsou definovány reakční doby?"), q("Jsou definovány povinnosti při incidentu?", 4, n("NIS2-05", "Article 21(2)(d)", "Supply chain security", "Doplnit povinnosti dodavatelů při incidentech.")), q("Mají dodavatelé omezené přístupy?"), q("Jsou dodavatelské účty pravidelně revidovány?", 4, n("NIS2-05", "Article 21(2)(d)", "Supply chain security", "Revidovat dodavatelské účty.")), q("Je přístup dodavatelů chráněn MFA?", 5, n("NIS2-11", "Article 21(2)(j)", "MFA and secure communications", "Chránit dodavatelské přístupy MFA.")), q("Je přístup dodavatelů logován?", 4, n("NIS2-05", "Article 21(2)(d)", "Supply chain security", "Logovat dodavatelské přístupy.")), q("Jsou dodavatelé pravidelně hodnoceni?"), q("Existuje exit plán při změně dodavatele?", 3, n("NIS2-05", "Article 21(2)(d)", "Supply chain security", "Vytvořit exit plán pro klíčové dodavatele.")), q("Jsou data u dodavatelů zálohována?"), q("Je řešena lokalita dat?"), q("Jsou dodavatelé součástí DR plánů?", 3, n("NIS2-04", "Article 21(2)(c)", "Business continuity", "Zahrnout klíčové dodavatele do DR plánů."))
    ]
  }
];

export const answerScore: Record<string, number | null> = {
  YES: 100,
  MOSTLY_YES: 75,
  PARTIAL: 50,
  MOSTLY_NO: 25,
  NO: 0,
  NOT_RELEVANT: null,
  UNKNOWN: 0
};

export const answerLabels = {
  YES: "Ano",
  MOSTLY_YES: "Spíše ano",
  PARTIAL: "Částečně",
  MOSTLY_NO: "Spíše ne",
  NO: "Ne",
  NOT_RELEVANT: "Není relevantní",
  UNKNOWN: "Nevím"
} as const;

export const recommendationLibrary = [
  ["MFA není zapnuté", "Zavést povinné vícefaktorové ověřování pro všechny uživatele, minimálně však pro administrátorské účty, vzdálené přístupy a cloudové služby."],
  ["Chybí evidence aktiv", "Zavést centrální evidenci HW, SW, serverů, síťových prvků, licencí a cloudových služeb. Každé aktivum musí mít vlastníka, kategorii, stav a kritičnost."],
  ["Zálohy nejsou testovány", "Zavést pravidelné testování obnovy ze záloh. Minimálně kvartálně provést test obnovy vybraného serveru, databáze a kritické aplikace."],
  ["Chybí incident response plán", "Vytvořit incident response plán včetně rolí, kontaktů, eskalační matice, postupů pro ransomware, phishing, kompromitaci účtu a únik dat."],
  ["Chybí síťová segmentace", "Rozdělit síť na samostatné segmenty pro uživatele, servery, výrobu, hosty, IoT a management. Mezi segmenty nastavit firewallová pravidla."],
  ["Administrátoři používají běžné účty", "Oddělit běžné a administrátorské účty. Administrátorské účty používat pouze pro správu, chránit MFA a pravidelně revidovat."],
  ["Chybí centrální logování", "Zavést centrální sběr a vyhodnocování logů ze serverů, firewallů, cloudových služeb, endpointů a identity provideru."],
  ["Chybí patch management", "Zavést proces pravidelné instalace bezpečnostních aktualizací včetně prioritizace podle kritičnosti zranitelností."],
  ["Chybí školení zaměstnanců", "Zavést pravidelné školení kyberbezpečnosti, phishingové simulace a krátké bezpečnostní kampaně pro zaměstnance."],
  ["Neexistuje DR plán", "Vytvořit disaster recovery plán s definovanými RTO/RPO, pořadím obnovy systémů, odpovědnostmi, kontakty a pravidelným testováním."]
];

export const roadmapByPriority: Record<Priority, string> = {
  P1: "0-30 dní",
  P2: "31-90 dní",
  P3: "91-180 dní",
  P4: "181-365 dní"
};
