export type Locale = "en" | "es";

export const translations: Record<
  Locale,
  {
    home: {
      badge: string;
      title: string;
      titleHighlight: string;
      subtitle: string;
      ctaScan: string;
      ctaEvidence: string;
      accuracy: string;
      depositsSaved: string;
      leasesScanned: string;
      availability: string;
      sectionTitle: string;
      cardScannerTitle: string;
      cardScannerDesc: string;
      cardScannerCta: string;
      cardDefenseTitle: string;
      cardDefenseDesc: string;
      cardDefenseCta: string;
      cardLockerTitle: string;
      cardLockerDesc: string;
      cardLockerCta: string;
      footerBrand: string;
      footerBuilt: string;
    };
    scanner: {
      dropTitle: string;
      dropSubtitle: string;
      selectFile: string;
      orSample: string;
      sampleLease: string;
      sampleLeaseSub: string;
      reading: string;
      analyzing: string;
      analyzingDesc: string;
      scanFailed: string;
      tryAgain: string;
      useSample: string;
      scanAnother: string;
      analyzedBy: string;
      overallRisk: string;
      leaseSummary: string;
      overview: string;
      comparison: string;
      risks: string;
      metric: string;
      yourContract: string;
      marketAvg: string;
      status: string;
      highRisk: string;
      mediumRisk: string;
      lowRisk: string;
      potentialSavings: string;
      issue: string;
      standardLegal: string;
      negotiationScript: string;
      copyEmail: string;
      translateToSpanish: string;
      showInEnglish: string;
    };
    header: {
      brand: string;
    };
  }
> = {
  en: {
    home: {
      badge: "AI-Powered Tenant Rights",
      title: "Defend Your Home",
      titleHighlight: "Without a Lawyer",
      subtitle:
        "Level the playing field with AI tools that analyze leases, document evidence, and generate legal notices instantly.",
      ctaScan: "Scan Your Lease",
      ctaEvidence: "Start Evidence Locker",
      accuracy: "Accuracy",
      depositsSaved: "Deposits Saved",
      leasesScanned: "Leases Scanned",
      availability: "AI Availability",
      sectionTitle: "Power to the Tenants",
      cardScannerTitle: "Contract Scanner",
      cardScannerDesc:
        "Upload your lease and our AI will flag hidden fees, illegal clauses, and predatory terms in seconds.",
      cardScannerCta: "Analyze Now",
      cardDefenseTitle: "Eviction Defense",
      cardDefenseDesc:
        "Document damage with photos/video. Our multimodal AI diagnoses issues (like mold) and cites the exact laws.",
      cardDefenseCta: "Build Defense",
      cardLockerTitle: "Evidence Locker",
      cardLockerDesc:
        "Store evidence immutably on the Solana blockchain. Generate a cryptographic certificate that holds up in court.",
      cardLockerCta: "Secure Evidence",
      footerBrand: "LegalDefender",
      footerBuilt: "Built with Next.js • Gemini 1.5 • Solana • DigitalOcean",
    },
    scanner: {
      dropTitle: "Drop your contract here",
      dropSubtitle: "Supports PDF, DOCX, TXT",
      selectFile: "Select File",
      orSample: "Or try a sample contract:",
      sampleLease: "Lease Agreement",
      sampleLeaseSub: "Residential Draft",
      reading: "Reading Document...",
      analyzing: "Analyzing Legal Terms...",
      analyzingDesc:
        "Gemini is reviewing every clause, extracting financial terms, and identifying potential risks.",
      scanFailed: "Scan failed",
      tryAgain: "Try again",
      useSample: "Use sample lease",
      scanAnother: "Scan Another Contract",
      analyzedBy: "Analyzed by Gemini 1.5",
      overallRisk: "Overall Risk Score",
      leaseSummary: "Lease Summary",
      overview: "overview",
      comparison: "comparison",
      risks: "risks",
      metric: "Metric",
      yourContract: "Your Contract",
      marketAvg: "Market Avg",
      status: "Status",
      highRisk: "high Risk",
      mediumRisk: "medium Risk",
      lowRisk: "low Risk",
      potentialSavings: "Potential Savings",
      issue: "Issue",
      standardLegal: "Standard / Legal",
      negotiationScript: "NEGOTIATION SCRIPT",
      copyEmail: "Copy Email",
      translateToSpanish: "Translate to Spanish",
      showInEnglish: "Show in English",
    },
    header: {
      brand: "LegalDefender",
    },
  },
  es: {
    home: {
      badge: "Derechos del inquilino con IA",
      title: "Defiende tu hogar",
      titleHighlight: "sin abogado",
      subtitle:
        "Nivela el campo con herramientas de IA que analizan contratos de arrendamiento, documentan pruebas y generan avisos legales al instante.",
      ctaScan: "Escanear tu contrato",
      ctaEvidence: "Iniciar bóveda de pruebas",
      accuracy: "Precisión",
      depositsSaved: "Depósitos recuperados",
      leasesScanned: "Contratos escaneados",
      availability: "IA disponible",
      sectionTitle: "El poder para los inquilinos",
      cardScannerTitle: "Escáner de contratos",
      cardScannerDesc:
        "Sube tu contrato y nuestra IA marcará tarifas ocultas, cláusulas ilegales y términos abusivos en segundos.",
      cardScannerCta: "Analizar ahora",
      cardDefenseTitle: "Defensa ante desalojo",
      cardDefenseDesc:
        "Documenta daños con fotos o video. Nuestra IA multimodal diagnostica problemas (como moho) y cita las leyes exactas.",
      cardDefenseCta: "Construir defensa",
      cardLockerTitle: "Bóveda de pruebas",
      cardLockerDesc:
        "Guarda pruebas de forma inmutable en Solana. Genera un certificado criptográfico válido en tribunales.",
      cardLockerCta: "Proteger pruebas",
      footerBrand: "LegalDefender",
      footerBuilt: "Hecho con Next.js • Gemini 1.5 • Solana • DigitalOcean",
    },
    scanner: {
      dropTitle: "Suelta tu contrato aquí",
      dropSubtitle: "PDF, DOCX, TXT",
      selectFile: "Seleccionar archivo",
      orSample: "O prueba un contrato de ejemplo:",
      sampleLease: "Contrato de arrendamiento",
      sampleLeaseSub: "Borrador residencial",
      reading: "Leyendo documento...",
      analyzing: "Analizando términos legales...",
      analyzingDesc:
        "Gemini está revisando cada cláusula, extrayendo términos financieros e identificando riesgos.",
      scanFailed: "Escaneo fallido",
      tryAgain: "Intentar de nuevo",
      useSample: "Usar contrato de ejemplo",
      scanAnother: "Escanear otro contrato",
      analyzedBy: "Analizado por Gemini 1.5",
      overallRisk: "Puntuación de riesgo",
      leaseSummary: "Resumen del contrato",
      overview: "resumen",
      comparison: "comparación",
      risks: "riesgos",
      metric: "Métrica",
      yourContract: "Tu contrato",
      marketAvg: "Promedio mercado",
      status: "Estado",
      highRisk: "Riesgo alto",
      mediumRisk: "Riesgo medio",
      lowRisk: "Riesgo bajo",
      potentialSavings: "Ahorro potencial",
      issue: "Problema",
      standardLegal: "Estándar / Legal",
      negotiationScript: "GUION DE NEGOCIACIÓN",
      copyEmail: "Copiar correo",
      translateToSpanish: "Traducir al español",
      showInEnglish: "Ver en inglés",
    },
    header: {
      brand: "LegalDefender",
    },
  },
};
