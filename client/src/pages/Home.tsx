import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, ChevronLeft, Package, Eye, TrendingUp, Zap, X, Maximize2, Minimize2, RefreshCw, DollarSign, Gem, CheckCircle2, Quote, Target, Smartphone, VolumeX, Volume2, Phone } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

/*
 * ═══════════════════════════════════════════════════════════════
 * Landing Page B2B — Projeto JLBV Life B Import
 * Cores: Roxo #704B9B | Magenta #E92085 | Verde #22C35D | Texto #221B32
 * ═══════════════════════════════════════════════════════════════
 */

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/LifeB_78863297.png";
const FACHADA_URL = "/fachada.png";
const WHATSAPP_LINK = "https://api.whatsapp.com/send/?phone=5562996437218&text=Ol%C3%A1!+Vi+o+Projeto+JLBV+da+Life+B+e+quero+saber+mais.&type=phone_number&app_absent=0";
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyLJ0T9RmRjI9Um9t4kmUg6GW7he3vCUu-7efnjmSChI2vcrtwFjYRcNCKz5m0RXdEW/exec";

const farmImages = [
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/farm_1_a6b8990d.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/farm_2_2f3d6732.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/farm_3_777dbece.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/farm_4_7e833a4b.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/farm_5_294c206e.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/farm_6_b224a721.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/farm_7_5871b867.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/farm_8_978dc09d.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/farm_9_ad5ff4ee.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/farm_10_514bf849.jpg",
];

const superImages = [
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/super_1_0a938658.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/super_2_297b8653.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/super_3_23b4a418.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/super_4_cee2b63f.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/super_5_c7a875d1.jpg",
];

const allCarouselImages = [
  ...farmImages.map((src) => ({ src, label: "Farmácia" })),
  ...superImages.map((src) => ({ src, label: "Supermercado" })),
];

/* ─── Variantes de animação ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ─── Hook: animar quando visível ─── */
function useAnimateOnView(threshold = 0.12) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return { ref, isInView };
}

/* ─── Componente wrapper animado ─── */
function AnimatedSection({ children, className = "", variants = fadeUp, threshold = 0.12 }: {
  children: React.ReactNode;
  className?: string;
  variants?: Record<string, any>;
  threshold?: number;
}) {
  const { ref, isInView } = useAnimateOnView(threshold);
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Hook: contador animado ─── */
function useCountUp(target: number, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let startTime: number | null = null;
    let raf: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, startCounting]);
  return count;
}

/* ─── Componente: número animado ─── */
function AnimatedCounter({ value, prefix = "+", suffix = "", color, inView }: {
  value: number; prefix?: string; suffix?: string; color: string; inView: boolean;
}) {
  const count = useCountUp(value, 2200, inView);
  return (
    <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 tabular-nums" style={{ color }}>
      {prefix}{count.toLocaleString("pt-BR")}{suffix}
    </p>
  );
}

/* ─── Ícone WhatsApp SVG ─── */
function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─── Helper: salva lead no Google Sheets ─── */
async function saveLeadToSheets(nome: string, telefone: string, origem: string, pagina: string) {
  try {
    await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        telefone,
        origem,
        pagina,
        data: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      }),
    });
  } catch (_) {}
}

/* ─── Helper: SHA-256 via crypto.subtle ─── */
async function sha256(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text.trim().toLowerCase());
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ─── Helper: lê userData salvo (visitas de retorno) ─── */
function getSavedUserData(): Record<string, string> | undefined {
  try {
    const raw = localStorage.getItem("jlbv_ud");
    return raw ? JSON.parse(raw) : undefined;
  } catch (_) { return undefined; }
}

/* ─── Helper: dispara Lead_Formulario no GA4 e Meta Pixel ─── */
async function trackLead(nome: string, telefone: string) {
  if (typeof window === "undefined") return;
  // GA4 — dispara independente do Meta Pixel
  if ((window as any).gtag) (window as any).gtag("event", "Lead_Formulario");
  // Meta Pixel — dispara só se fbq estiver disponível
  if (!(window as any).fbq) return;
  try {
    const fn = nome.trim().toLowerCase().split(" ")[0];
    const ln = nome.trim().toLowerCase().split(" ").slice(1).join(" ") || undefined;
    const phone = telefone.replace(/\D/g, "");
    const [hashedFn, hashedPhone, hashedLn] = await Promise.all([
      sha256(fn),
      sha256(phone),
      ln ? sha256(ln) : Promise.resolve(undefined),
    ]);
    const userData: Record<string, string> = { fn: hashedFn, ph: hashedPhone };
    if (hashedLn) userData.ln = hashedLn;
    // salva para visitas futuras
    try { localStorage.setItem("jlbv_ud", JSON.stringify(userData)); } catch (_) {}
    (window as any).fbq("trackCustom", "Lead_Formulario", {}, { userData });
  } catch (_) {
    (window as any).fbq("trackCustom", "Lead_Formulario");
  }
}

/* ─── Hook: scroll depth 25% / 50% / 75% ─── */
function useScrollDepth() {
  useEffect(() => {
    const fired = new Set<number>();
    const handle = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = Math.round((window.scrollY / total) * 100);
      [25, 50, 75, 100].forEach((t) => {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          if ((window as any).fbq) (window as any).fbq("trackCustom", `ScrollDepth_${t}`);
          if ((window as any).gtag) (window as any).gtag("event", `ScrollDepth_${t}`);
        }
      });
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);
}

/* ─── Subtítulo de seção ─── */
function SectionLabel({ text }: { text: string }) {
  return (
    <span className="inline-block text-xs sm:text-sm font-bold text-[#E92085] uppercase tracking-[0.2em] mb-3 sm:mb-4">
      {text}
    </span>
  );
}

/* ─── Formata telefone: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX ─── */
function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  // Remove código do país +55 se a pessoa digitou
  if (digits.startsWith("55") && digits.length >= 12) digits = digits.slice(2);
  digits = digits.slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (digits.length <= 10) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

/* ─── Modal de captura de lead ─── */
function LeadModal({ isOpen, source, pagina, onClose, onSkip, noWhatsapp = false }: {
  isOpen: boolean;
  source: string;
  pagina: string;
  onClose: () => void;
  onSkip: () => void;
  noWhatsapp?: boolean;
}) {
  const [nome, setNome] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [telefone, setTelefone] = useState("");
  const nomeRef = useRef<HTMLInputElement>(null);
  const touchStartY = useRef(0);
  const preencheuFired = useRef(false);
  const submittedRef = useRef(false);
  const hasOpenedRef = useRef(false);

  const rawDigits = telefone.replace(/\D/g, "");
  const phoneValid = rawDigits.length >= 10;

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      setShowSuccess(false);
      try {
        const saved = localStorage.getItem("jlbv_lead");
        if (saved) {
          const { nome: n, telefone: t } = JSON.parse(saved);
          setNome(n || "");
          setTelefone(t || "");
        } else {
          setNome("");
          setTelefone("");
        }
      } catch (_) {
        setNome("");
        setTelefone("");
      }
      preencheuFired.current = false;
      submittedRef.current = false;
      document.body.style.overflow = "hidden";
      setTimeout(() => nomeRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Captura lead que fechou o formulário sem enviar
  useEffect(() => {
    if (!isOpen && !submittedRef.current && hasOpenedRef.current) {
      // Evento dispara sempre que o X é clicado
      if ((window as any).fbq) {
        const eventId = `abandonou_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        (window as any).fbq("trackCustom", "Abandonou_Formulario", {}, { eventID: eventId });
      }
      if ((window as any).gtag) (window as any).gtag("event", "Abandonou_Formulario");
      // Salva na planilha e localStorage só quando tem telefone válido
      if (rawDigits.length >= 10) {
        saveLeadToSheets(nome.trim(), telefone.trim(), `${source} (Abandonou_Formulario)`, pagina);
        try { localStorage.setItem("jlbv_lead", JSON.stringify({ nome: nome.trim(), telefone: telefone.trim() })); } catch (_) {}
      }
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Captura lead que fechou a aba/página com formulário aberto e preenchido
  useEffect(() => {
    const handleUnload = () => {
      if (!isOpen || rawDigits.length < 10 || submittedRef.current) return;
      const payload = JSON.stringify({
        nome: nome.trim(),
        telefone: telefone.trim(),
        origem: `${source} (Fechou a Pagina)`,
        pagina,
        data: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      });
      try { navigator.sendBeacon(SHEETS_WEBHOOK_URL, new Blob([payload], { type: "application/json" })); } catch (_) {}
      try { localStorage.setItem("jlbv_lead", JSON.stringify({ nome: nome.trim(), telefone: telefone.trim() })); } catch (_) {}
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [isOpen, nome, telefone, source, pagina]); // eslint-disable-line react-hooks/exhaustive-deps

  const firePreencheu = () => {
    if (!preencheuFired.current) {
      preencheuFired.current = true;
      if ((window as any).gtag) (window as any).gtag("event", "Preencheu_Formulario");
      if ((window as any).fbq) {
        const eventId = `preencheu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        (window as any).fbq("trackCustom", "Preencheu_Formulario", {}, { eventID: eventId });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid) return;
    submittedRef.current = true;
    try { localStorage.setItem("jlbv_lead", JSON.stringify({ nome: nome.trim(), telefone: telefone.trim() })); } catch (_) {}
    trackLead(nome.trim(), telefone.trim());
    saveLeadToSheets(nome.trim(), telefone.trim(), source, pagina);
    if (noWhatsapp) {
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); onClose(); }, 4000);
    } else {
      window.open(WHATSAPP_LINK, "_blank");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet — sobe de baixo no mobile, centralizado no desktop */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[96] sm:inset-0 sm:flex sm:items-center sm:justify-center pointer-events-none"
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md pointer-events-auto shadow-2xl relative"
              onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
              onTouchEnd={(e) => { if (e.changedTouches[0].clientY - touchStartY.current > 80) onClose(); }}
            >
              {/* Handle bar — mobile only */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Botão fechar — desktop */}
              <button
                onClick={onClose}
                className="hidden sm:flex absolute top-4 right-4 items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>

              <div className="px-6 pb-8 pt-4 sm:px-8 sm:pb-10 sm:pt-8">
                <img src={LOGO_URL} alt="Life B" className="h-10 mb-5 mx-auto" />

                {showSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-[#704B9B]/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#704B9B]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#221B32] mb-2">Recebemos seu contato!</h3>
                    <p className="text-sm text-gray-500">Nossa equipe entrará em contato em breve.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#221B32] mb-1 leading-snug text-center">
                      {noWhatsapp ? "Fale com um consultor" : "Fale agora com um consultor"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed text-center">
                      {noWhatsapp ? "Preencha seus dados e nosso especialista entrará em contato:" : "Preencha seus dados e vá direto para o WhatsApp:"}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        ref={nomeRef}
                        type="text"
                        placeholder="Seu nome (opcional)"
                        value={nome}
                        onChange={(e) => { setNome(e.target.value); firePreencheu(); }}
                        autoComplete="name"
                        className="w-full px-4 py-4 rounded-xl border border-gray-200 text-[#221B32] placeholder-gray-400 text-base focus:outline-none focus:border-[#704B9B] focus:ring-2 focus:ring-[#704B9B]/20 transition-all"
                      />
                      <div className="flex items-center w-full rounded-xl border border-gray-200 focus-within:border-[#704B9B] focus-within:ring-2 focus-within:ring-[#704B9B]/20 transition-all overflow-hidden">
                        <div className="flex items-center gap-1 pl-3 pr-2.5 border-r border-gray-200 flex-shrink-0 select-none">
                          <span className="text-lg leading-none">🇧🇷</span>
                          <span className="text-[#221B32] text-sm font-medium">+55</span>
                        </div>
                        <input
                          type="tel"
                          placeholder={noWhatsapp ? "DDD + seu telefone" : "DDD + número do WhatsApp"}
                          value={telefone}
                          onChange={(e) => { setTelefone(formatPhone(e.target.value)); firePreencheu(); }}
                          required
                          autoComplete="tel"
                          inputMode="numeric"
                          className="flex-1 px-3 py-4 text-[#221B32] placeholder-gray-400 text-base focus:outline-none bg-transparent"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!phoneValid}
                        className="w-full flex items-center justify-center gap-2.5 bg-[#22C35D] hover:bg-[#1dab52] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base transition-all shadow-[0_8px_24px_-4px_rgba(34,195,93,0.4)] active:scale-[0.98]"
                      >
                        {noWhatsapp ? <Phone className="w-5 h-5 flex-shrink-0" /> : <WhatsAppIcon className="w-5 h-5 flex-shrink-0" />}
                        {noWhatsapp ? "Enviar" : "Continuar para o WhatsApp"}
                      </button>
                    </form>

                    {!noWhatsapp && (
                    <div className="text-center mt-4">
                      <button
                        onClick={onSkip}
                        className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors py-1"
                      >
                        Pular e ir direto para o WhatsApp
                      </button>
                    </div>
                  )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Botão CTA WhatsApp ─── */
function WhatsAppCTA({ text, size = "default", onOpen, noWhatsapp = false }: {
  text: string;
  size?: "default" | "large";
  onOpen: () => void;
  noWhatsapp?: boolean;
}) {
  const base = "inline-flex items-center justify-center bg-[#22C35D] hover:bg-[#1dab52] active:bg-[#189a47] text-white font-bold gap-2.5 shadow-[0_8px_24px_-4px_rgba(233,32,133,0.4)] transition-all duration-200 hover:shadow-[0_12px_32px_-4px_rgba(233,32,133,0.5)] hover:-translate-y-0.5 rounded-full active:scale-[0.98]";
  const sizeClass = size === "large"
    ? "w-full sm:w-auto px-6 py-4 text-base sm:px-8 sm:py-4 sm:text-lg"
    : "w-full sm:w-auto px-5 py-3.5 text-sm sm:px-8 sm:py-4 sm:text-lg";

  return (
    <button onClick={onOpen} className="block sm:inline-block w-full sm:w-auto">
      <span className={base + " " + sizeClass}>
        {noWhatsapp
          ? <Phone className={size === "large" ? "w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" : "w-5 h-5 flex-shrink-0"} />
          : <WhatsAppIcon className={size === "large" ? "w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" : "w-5 h-5 flex-shrink-0"} />
        }
        <span className="leading-tight">{text}</span>
      </span>
    </button>
  );
}

/* ─── Componente: vídeo embed com overlay bloqueando links externos ─── */
function VideoEmbed({ src, title, autoplayMuted = false }: { src: string; title: string; autoplayMuted?: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(autoplayMuted);
  const [expanded, setExpanded] = useState(false);

  const isVimeo = src.includes("vimeo.com");

  const sendCommand = (action: "play" | "pause") => {
    if (isVimeo) {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ method: action }), "*");
    } else {
      const func = action === "play" ? "playVideo" : "pauseVideo";
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
    }
  };

  const sendVolumeCommand = (mute: boolean) => {
    if (isVimeo) {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ method: "setVolume", value: mute ? 0 : 1 }), "*");
    } else {
      const func = mute ? "mute" : "unMute";
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
    }
  };

  const handleOverlayClick = () => {
    if (autoplayMuted) {
      const newMuted = !muted;
      setMuted(newMuted);
      sendVolumeCommand(newMuted);
    } else {
      if (playing) {
        sendCommand("pause");
      } else {
        sendCommand("play");
      }
      setPlaying(!playing);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  let embedSrc = isVimeo ? src : src.replace("enablejsapi=0", "enablejsapi=1");
  if (autoplayMuted && isVimeo) embedSrc += "&autoplay=1&muted=1&loop=1";

  return (
    <>
      {/* Backdrop ao expandir */}
      {expanded && (
        <div
          className="fixed inset-0 z-[149] bg-black/70"
          onClick={toggleExpand}
        />
      )}

      {/* Container — muda só o CSS, iframe não é remontado */}
      <div
        className={
          expanded
            ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[150] h-[82vh] rounded-2xl overflow-hidden shadow-2xl"
            : "relative aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_8px_32px_-8px_rgba(112,75,155,0.2)]"
        }
        style={expanded ? { aspectRatio: "9/16" } : {}}
      >
        <iframe
          ref={iframeRef}
          src={embedSrc}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          title={title}
        />
        {/* Overlay transparente — bloqueia cliques para o YouTube */}
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={handleOverlayClick} />

        {/* Indicador de som — só no modo autoplayMuted */}
        {autoplayMuted && (
          <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/65 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-semibold pointer-events-none transition-opacity duration-500 ${muted ? "opacity-100 animate-pulse" : "opacity-0"}`}>
            <VolumeX className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Toque para ativar o som</span>
          </div>
        )}
        {autoplayMuted && !muted && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/65 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-semibold pointer-events-none">
            <Volume2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Som ativado</span>
          </div>
        )}

        {/* Botão expandir/minimizar — sempre visível */}
        <button
          onClick={toggleExpand}
          className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 rounded-lg p-1.5 z-20 transition-colors"
          aria-label={expanded ? "Minimizar" : "Expandir"}
        >
          {expanded
            ? <Minimize2 className="w-4 h-4 text-white" />
            : <Maximize2 className="w-4 h-4 text-white" />
          }
        </button>

        {/* Botão X extra ao expandir — topo direito */}
        {expanded && (
          <button
            onClick={toggleExpand}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-1.5 z-20 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </>
  );
}

/* ─── Lightbox Modal ─── */
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handleKey); };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors z-10" aria-label="Fechar">
        <X className="w-6 h-6" />
      </button>
      <motion.img
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.25 }}
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
}

/* ─── Dados ─── */
const jlbvBenefits = [
  {
    icon: Package,
    title: "Produto & Inovação",
    description: 'Produtos pensados em "dores", "desejos" e "impulso".',
    detail: "Itens consagrados na internet migrados para lojas físicas, atendendo desejos latentes do público feminino: os \"Mimos Acessíveis\".",
  },
  {
    icon: Eye,
    title: "Exposição Estratégica",
    description: "Mega Vision USA: mais visibilidade nas gôndolas.",
    detail: "Layout categorizado que otimiza espaços, maximiza visibilidade e ativa a memória do consumidor, estimulando compras por impulso.",
  },
  {
    icon: TrendingUp,
    title: "Alta Rentabilidade",
    description: "Maior rentabilidade da loja.",
    detail: "Acessórios possuem as maiores margens do varejo. Baixo investimento e alta lucratividade por m² com retorno rápido.",
  },
  {
    icon: Zap,
    title: "Venda Silenciosa",
    description: "Técnicas que vendem naturalmente.",
    detail: "Disposição estratégica funciona como \"vendedor silencioso\": os itens se vendem sozinhos pelo posicionamento e organização visual.",
  },
  {
    icon: Target,
    title: "Produtos Focados",
    description: "Itens que o consumidor já deseja.",
    detail: "Foco em produtos consagrados na internet e nas redes sociais, com alta demanda comprovada pelo público feminino.",
  },
  {
    icon: Smartphone,
    title: "Do Digital ao Físico",
    description: "Tendências online na sua loja.",
    detail: "Migramos os produtos mais desejados do e-commerce para o ponto de venda físico, capturando a demanda latente do consumidor.",
  },
];

const testimonials = [
  {
    before: "R$ 27.000", after: "R$ 160.000", growth: "500%",
    company: "Rede de Drogarias Droga Center", location: "Distrito Federal",
    description: "Antes da implantação do projeto JLBV a rede faturava R$ 27.000 em acessórios, atualmente está faturando R$ 160.000.",
  },
  {
    before: "R$ 3.000", after: "R$ 12.000", growth: "300%",
    company: "Rede de Supermercado Super Couto", location: "Goiás",
    description: "Antes da implantação do projeto JLBV a rede faturava R$ 3.000 em acessórios, atualmente está faturando R$ 12.000.",
  },
  {
    before: "R$ 15.000", after: "R$ 80.000", growth: "450%",
    company: "Rede de Drogarias Distrital", location: "Distrito Federal",
    description: "Antes da implantação do projeto JLBV a rede faturava R$ 15.000 em acessórios, atualmente está faturando R$ 80.000.",
  },
];

const faqData = [
  {
    q: "O que é o Projeto JLBV?",
    a: "É um método exclusivo da Life B que organiza e expõe acessórios nas gôndolas com o padrão Mega Vision USA. Transforma espaços parados em pontos de alta lucratividade, com crescimento mínimo de 300% na categoria.",
  },
  {
    q: "Qual o investimento e prazo de implantação?",
    a: "O investimento é acessível e proporcional ao tamanho da loja, com compra direta da indústria (sem intermediários). A implantação é rápida, em média poucos dias, sem interromper o funcionamento do estabelecimento.",
  },
  {
    q: "Quais estabelecimentos podem aderir?",
    a: "Farmácias, drogarias, supermercados, lojas de cosméticos e conveniências. Já são mais de 2.000 projetos implantados em todo o Brasil, com resultados comprovados em redes como Droga Center (DF) e Drogarias Distrital (DF).",
  },
  {
    q: "Qual o crescimento esperado?",
    a: "O crescimento mínimo garantido é de 300%. Nossos cases reais demonstram resultados superiores: Droga Center cresceu 500% (de R$ 27 mil para R$ 160 mil) e Drogarias Distrital cresceu 450%.",
  },
  {
    q: "Como solicitar uma proposta?",
    a: "Clique em qualquer botão de WhatsApp nesta página para falar com um consultor. Você receberá o catálogo completo e uma proposta personalizada para o seu negócio.",
  },
];

const stats = [
  { value: 1400, label: "SKUs", suffix: "", desc: "Mix completo em acessórios de saúde, higiene e beleza", color: "#704B9B" },
  { value: 500, label: "Lançamentos em 2026", suffix: "", desc: "Maior valor agregado e lucratividade", color: "#E92085" },
  { value: 2000, label: "Projetos Implantados", suffix: "", desc: "Em farmácias, supermercados e lojas de cosméticos", color: "#704B9B" },
  { value: 300, label: "Crescimento Mínimo", suffix: "%", desc: "Garantido na categoria de acessórios", color: "#E92085" },
];

/* ═══════════════════════════════════════════════════════════════ */

export default function Home({ directMode = false, variant }: { directMode?: boolean; variant?: "video1" | "rmk" | "contato" }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState<{ src: string; alt: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState("");

  const pagina = window.location.href;
  const noWhatsapp = variant === "contato";

  const openModal = useCallback((source: string) => {
    if (directMode) {
      if ((window as any).fbq) (window as any).fbq("trackCustom", "Contato_WhatsApp");
    if ((window as any).gtag) (window as any).gtag("event", "Contato_WhatsApp");
      window.open(WHATSAPP_LINK, "_blank");
      return;
    }
    setModalSource(source);
    setModalOpen(true);
    if ((window as any).fbq) (window as any).fbq("trackCustom", "Abrir_Formulario");
    if ((window as any).gtag) (window as any).gtag("event", "Abrir_Formulario");
  }, [directMode]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleSkip = useCallback(() => {
    if ((window as any).fbq) (window as any).fbq("trackCustom", "Pular_Formulario");
    if ((window as any).gtag) (window as any).gtag("event", "Pular_Formulario");
    window.open(WHATSAPP_LINK, "_blank");
    setModalOpen(false);
  }, []);

  // Scroll depth tracking
  useScrollDepth();

  // PageView
  useEffect(() => {
    if (!(window as any).fbq) return;
    try {
      const userData = getSavedUserData();
      if (userData) {
        (window as any).fbq("track", "PageView", {}, { userData });
      } else {
        (window as any).fbq("track", "PageView");
      }
    } catch (_) {
      (window as any).fbq("track", "PageView");
    }
  }, []);

  // Carrossel automático
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allCarouselImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % allCarouselImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + allCarouselImages.length) % allCarouselImages.length);
  const openLightbox = useCallback((src: string, alt: string) => setLightboxSrc({ src, alt }), []);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });
  const benefitsRef = useRef(null);
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.1 });
  const testimonialsRef = useRef(null);
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.1 });
  const galleryBulletsRef = useRef(null);
  const galleryBulletsInView = useInView(galleryBulletsRef, { once: true, amount: 0.2 });
  const casesRmkRef = useRef(null);
  const casesRmkInView = useInView(casesRmkRef, { once: true, amount: 0.2 });

  /* ══════════════════════════════════════════════
     VARIANTE: /rmk — Página de Remarketing
  ══════════════════════════════════════════════ */
  if (variant === "rmk") {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">

        <LeadModal isOpen={modalOpen} source={modalSource} pagina={pagina} onClose={closeModal} onSkip={handleSkip} noWhatsapp={noWhatsapp} />

        {/* HEADER */}
        <motion.header
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
        >
          <div className="container flex items-center justify-between py-3">
            <img src={LOGO_URL} alt="Life B Import" className="h-8 sm:h-10 md:h-12 w-auto" />
            <button onClick={() => openModal("Header RMK — Fale Conosco")}>
              <span className="inline-flex items-center gap-2 bg-[#22C35D] hover:bg-[#1dab52] text-white rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all hover:shadow-md shadow-[0_4px_12px_-2px_rgba(233,32,133,0.3)] active:scale-[0.97]">
                <WhatsAppIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Fale Conosco</span>
              </span>
            </button>
          </div>
        </motion.header>

        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#704B9B] via-[#8B5FBF] to-[#E92085]">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="container py-12 sm:py-16 md:py-20 text-center text-white relative">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[10px] sm:text-xs uppercase tracking-[.2em] text-white/50 mb-3 font-semibold">
              Projeto JLBV · Life B Import
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight mb-4">
              Enquanto você avalia, outra loja<br className="hidden sm:block" /> da sua região pode estar implantando primeiro.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-sm sm:text-lg text-white/75 mb-7 max-w-lg mx-auto leading-relaxed">
              Mais de 2.000 lojistas já decidiram. O que está segurando você?
            </motion.p>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center gap-3">
              <button onClick={() => openModal("Hero RMK — Quero resultado")} className="inline-flex items-center gap-2.5 bg-white text-[#704B9B] font-black rounded-full px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base shadow-[0_8px_32px_-4px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform active:scale-[0.98] whitespace-nowrap">
                <WhatsAppIcon className="w-5 h-5 text-[#22C35D] flex-shrink-0" />
                Quero esse resultado na minha loja
              </button>
              <p className="text-white/50 text-xs">
                ✓ Vagas limitadas por região · resposta em minutos
              </p>
            </motion.div>
          </div>
        </section>

        {/* QUEBRA DE OBJEÇÃO */}
        <section className="py-8 sm:py-10 bg-white border-b border-gray-100">
          <div className="container max-w-lg mx-auto text-center">
            <AnimatedSection variants={fadeUp}>
              <div className="inline-flex items-center gap-2 bg-[#704B9B]/10 rounded-full px-4 py-1.5 mb-4">
                <CheckCircle2 className="w-4 h-4 text-[#704B9B] flex-shrink-0" />
                <span className="text-xs font-bold text-[#704B9B] uppercase tracking-wider">Sem risco para você</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#221B32] leading-snug mb-3">Sem custo extra de implantação.<br />Você só continua se gostar do resultado.</p>
              <p className="text-gray-500 text-sm sm:text-base mb-1">Nosso time atende por região. Verifique disponibilidade na sua cidade.</p>
              <p className="text-gray-400 text-xs mb-6">Atendemos lojistas em Goiás e Distrito Federal.</p>
              <button onClick={() => openModal("Objeção RMK — Quero resultado")} className="inline-flex items-center gap-2.5 bg-[#704B9B] hover:bg-[#5d3d85] text-white font-black rounded-full px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base shadow-lg hover:scale-105 transition-transform active:scale-[0.98] whitespace-nowrap">
                <WhatsAppIcon className="w-5 h-5 text-[#22C35D] flex-shrink-0" />
                Quero esse resultado na minha loja
              </button>
              <p className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mt-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C35D] flex-shrink-0" />
                Sem compromisso para a primeira conversa
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* CASES */}
        <section className="pt-8 sm:pt-12 pb-6 sm:pb-8 bg-gray-50" ref={casesRmkRef}>
          <div className="container">
            <AnimatedSection variants={fadeUp}>
              <p className="text-center text-[10px] sm:text-xs uppercase tracking-[.18em] text-[#704B9B] font-bold mb-2">Números reais · lojistas como você</p>
              <h2 className="text-center text-xl sm:text-3xl font-black text-[#221B32] mb-1">O que acontece quando você entra no projeto</h2>
              <p className="text-center text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8">Crescimento em acessórios de higiene e beleza · clientes ativos em GO e DF</p>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { loja: "Droga Center", local: "Brasília · DF", antes: "R$ 27 mil", depois: "R$ 160 mil", value: 500, cor: "#22C35D", logo: "/logos/droga-center.png", maxW: "max-w-[150px]", maxH: "max-h-9 sm:max-h-10" },
                { loja: "Super Couto", local: "Goiânia · GO", antes: "R$ 3 mil", depois: "R$ 12 mil", value: 300, cor: "#E92085", logo: "/logos/super-couto.png", maxW: "max-w-[120px] sm:max-w-[140px]", maxH: "max-h-12 sm:max-h-14" },
                { loja: "Drogarias Distrital", local: "Brasília · DF", antes: "R$ 15 mil", depois: "R$ 80 mil", value: 450, cor: "#704B9B", logo: "/logos/drogaria-distrital.png", maxW: "max-w-[160px] sm:max-w-[180px]", maxH: "max-h-12 sm:max-h-14" },
              ].map((c, i) => (
                <AnimatedSection key={i} variants={fadeUp} style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 text-center h-full flex flex-col">
                    <div className="h-1.5 w-full" style={{ background: c.cor }} />
                    <div className="flex flex-col items-center justify-center gap-2 p-4 sm:p-5 flex-1">
                      <TrendingUp className="w-5 h-5" style={{ color: c.cor }} />
                      <AnimatedCounter value={c.value} prefix="+" suffix="%" color={c.cor} inView={casesRmkInView} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">de crescimento no faturamento</p>
                      <div className="w-8 h-px bg-gray-200 my-1" />
                      <div className="flex items-center justify-center w-full py-1">
                        <img src={c.logo} alt={c.loja} className={`${c.maxH} ${c.maxW} w-auto object-contain rounded-md`} />
                      </div>
                      <p className="text-xs text-gray-400">{c.local}</p>
                      <div className="inline-flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1">
                        <span className="text-xs text-gray-400 line-through">{c.antes}</span>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: c.cor }} />
                        <span className="text-xs font-black text-[#221B32]">{c.depois}</span>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection variants={fadeUp}>
              <div className="mt-5 text-center">
                <button onClick={() => openModal("Cases RMK — Quero resultado")} className="inline-flex items-center gap-2 bg-[#704B9B] hover:bg-[#5d3d85] text-white font-bold rounded-full px-7 py-3 text-sm transition-all hover:shadow-lg active:scale-[0.98]">
                  <WhatsAppIcon className="w-4 h-4 flex-shrink-0" />
                  Quero esse resultado na minha loja
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* O SEGREDO DA MARGEM */}
        <section className="pt-6 sm:pt-10 pb-8 sm:pb-12 bg-gray-50">
          <div className="container">
            <AnimatedSection variants={fadeUp}>
              <p className="text-[10px] sm:text-xs uppercase tracking-[.18em] text-[#704B9B] font-bold mb-3 text-center">Por que acessórios de higiene e beleza?</p>
              <h2 className="text-xl sm:text-3xl font-black text-[#221B32] mb-6 sm:mb-8 text-center leading-snug">O segredo da margem que a maioria dos lojistas ainda ignora</h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
              {[
                { icon: "🛒", titulo: "O cliente não pesquisa preço", desc: "Escova de cabelo, bucha de banho, protetor de seios: o consumidor vê na gôndola, reconhece que precisa e leva na hora. Sem pesquisar, sem comparar preço.", color: "#704B9B" },
                { icon: "📈", titulo: "Compra por impulso altíssima", desc: "Acessórios de higiene e beleza têm uma das maiores taxas de compra por impulso do varejo. A maioria dos lojistas ainda não aproveitou esse potencial.", color: "#E92085" },
                { icon: "🎯", titulo: "Produto certo no lugar certo", desc: "O Projeto JLBV foi construído em cima desse comportamento. Exposição estratégica que transforma espaço ocioso em faturamento real.", color: "#22C35D" },
              ].map((c, i) => (
                <AnimatedSection key={i} variants={fadeUp} style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 h-full flex flex-col">
                    <div className="h-1 w-full" style={{ background: c.color }} />
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm" style={{ background: `${c.color}18` }}>
                        {c.icon}
                      </div>
                      <p className="font-bold text-[#221B32] text-sm sm:text-base">{c.titulo}</p>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{c.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection variants={fadeUp}>
              <div className="text-center">
                <button onClick={() => openModal("Margem RMK — Quero resultado")} className="inline-flex items-center gap-2.5 bg-[#704B9B] hover:bg-[#5d3d85] text-white font-bold rounded-full px-7 py-3.5 text-sm transition-all hover:shadow-lg active:scale-[0.98] whitespace-nowrap">
                  <WhatsAppIcon className="w-4 h-4 flex-shrink-0" />
                  Quero esse resultado na minha loja
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="py-8 sm:py-10 bg-white border-t border-gray-100">
          <div className="container max-w-xl mx-auto">
            <AnimatedSection variants={fadeUp}>
              <h2 className="text-center text-xl sm:text-2xl font-black text-[#221B32] mb-1">Como funciona na prática</h2>
              <p className="text-center text-xs sm:text-sm text-gray-400 mb-5 sm:mb-6">Você no controle do início ao fim</p>
            </AnimatedSection>
            <div className="flex flex-col gap-3">
              {[
                { n: "1", titulo: "Conversa sem compromisso", desc: "Um consultor entende sua loja e apresenta o projeto." },
                { n: "2", titulo: "Implantação na sua loja", desc: "A equipe organiza tudo, você não precisa parar as operações." },
                { n: "3", titulo: "Crescimento mês a mês", desc: "Suporte contínuo e resultado que você acompanha nas vendas." },
              ].map((p, i) => (
                <AnimatedSection key={i} variants={fadeUp} style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#704B9B] to-[#E92085] flex items-center justify-center flex-shrink-0 text-white font-black text-sm shadow-sm">{p.n}</div>
                    <div>
                      <p className="font-bold text-[#221B32] text-sm">{p.titulo}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-[#704B9B] to-[#E92085]">
          <div className="container max-w-lg mx-auto text-center text-white">
            <AnimatedSection variants={fadeUp}>
              <p className="text-[10px] uppercase tracking-[.2em] text-white/50 font-bold mb-4">Sua decisão é agora</p>
              <h2 className="text-2xl sm:text-3xl font-black leading-snug mb-3">Pronto para ter o JLBV na sua loja?</h2>
              <p className="text-white/70 text-sm sm:text-base mb-6">Fale com um consultor hoje, veja como funciona na prática e decida sem pressão.</p>
              <button onClick={() => openModal("CTA Final RMK")} className="inline-flex items-center gap-2.5 bg-white text-[#704B9B] font-black rounded-full px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base shadow-lg hover:scale-105 transition-transform active:scale-[0.98] whitespace-nowrap">
                <WhatsAppIcon className="w-5 h-5 text-[#22C35D] flex-shrink-0" />
                Quero implantar na minha loja
              </button>
              <p className="flex items-center justify-center gap-1.5 text-white/40 text-xs mt-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C35D] flex-shrink-0" />
                Vagas limitadas por região · sem compromisso
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#1a1625] text-gray-400 py-8">
          <div className="container text-center">
            <img src={LOGO_URL} alt="Life B" className="h-10 mx-auto mb-4 brightness-0 invert" />
            <p className="text-xs text-gray-500 mb-1">LVL IMPORTADORA LTDA. | CNPJ: 33.751.598/0001-00</p>
            <p className="text-xs text-gray-600 mb-4">&copy; 2026 Life B. Todos os direitos reservados.</p>
            <button onClick={() => openModal("Footer RMK — Telefone")} className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-white transition-colors">
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#22C35D]" />
              (62) 99643-7218
            </button>
          </div>
        </footer>

        {/* BOTÃO FLUTUANTE */}
        <motion.button
          onClick={() => openModal("Botão Flutuante")}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 180, damping: 12 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#22C35D] hover:bg-[#1dab52] text-white p-3.5 sm:p-4 rounded-full shadow-[0_8px_24px_-4px_rgba(233,32,133,0.4)]"
          aria-label="Abrir WhatsApp"
        >
          <WhatsAppIcon className="w-6 h-6" />
        </motion.button>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══════════ LIGHTBOX ═══════════ */}
      <AnimatePresence>
        {lightboxSrc && <Lightbox src={lightboxSrc.src} alt={lightboxSrc.alt} onClose={closeLightbox} />}
      </AnimatePresence>

      {/* ═══════════ MODAL DE LEAD ═══════════ */}
      <LeadModal isOpen={modalOpen} source={modalSource} pagina={pagina} onClose={closeModal} onSkip={handleSkip} noWhatsapp={noWhatsapp} />

      {/* ═══════════ HEADER ═══════════ */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
      >
        <div className="container flex items-center justify-between py-3">
          <img src={LOGO_URL} alt="Life B Import" className="h-8 sm:h-10 md:h-12 w-auto" />
          <button onClick={() => openModal("Header — Fale Conosco")}>
            <span className="inline-flex items-center gap-2 bg-[#22C35D] hover:bg-[#1dab52] text-white rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all hover:shadow-md shadow-[0_4px_12px_-2px_rgba(233,32,133,0.3)] active:scale-[0.97]">
              {noWhatsapp ? <Phone className="w-4 h-4" /> : <WhatsAppIcon className="w-4 h-4" />}
              <span className="hidden sm:inline">{noWhatsapp ? "Falar com consultor" : "Fale Conosco"}</span>
            </span>
          </button>
        </div>
      </motion.header>

      {/* ═══════════ SEÇÃO 1: HERO ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#704B9B] via-[#8B5FBF] to-[#E92085]">
        <div className="container py-10 sm:py-14 md:py-20 lg:py-28">

          {/* MOBILE: imagens ou vídeo */}
          {variant === "video1" ? (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col items-center mb-6 lg:hidden">
              <div className="w-full max-w-[260px] sm:max-w-[280px]">
                <VideoEmbed
                  src="https://player.vimeo.com/video/1178399214?badge=0&autopause=0&player_id=0&app_id=58479"
                  title="Projeto JLBV — Supermercado"
                  autoplayMuted
                />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">
                  🛒 Supermercados
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">
                  💊 Farmácias & Drogarias
                </span>
              </div>
            </motion.div>
          ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-2 gap-3 mb-6 lg:hidden">
            <motion.div
              variants={fadeLeft}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => openLightbox(farmImages[0], "Projeto JLBV em Farmácias")}
            >
              <img src={farmImages[0]} alt="Projeto JLBV em Farmácias" className="w-full h-full object-cover" loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg p-2">
                <p className="font-bold text-xs text-[#221B32] leading-tight">Projeto JLBV</p>
                <p className="text-[10px] text-[#E92085] font-semibold">Farmácias</p>
              </div>
            </motion.div>
            <motion.div
              variants={fadeRight}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => openLightbox(superImages[0], "Projeto JLBV em Supermercados")}
            >
              <img src={superImages[0]} alt="Projeto JLBV em Supermercados" className="w-full h-full object-cover" loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg p-2">
                <p className="font-bold text-xs text-[#221B32] leading-tight">Projeto JLBV</p>
                <p className="text-[10px] text-[#704B9B] font-semibold">Supermercados</p>
              </div>
            </motion.div>
          </motion.div>
          )}

          {/* DESKTOP: lado a lado */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-5 lg:space-y-7">
              <motion.div variants={fadeUp} className={`px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 ${variant === "video1" ? "hidden lg:inline-block" : "inline-block"}`}>
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">Projeto Exclusivo JLBV</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] font-extrabold text-white leading-[1.1]">
                Transforme Acessórios em{" "}
                <span className="text-[#22C35D] border-b-2 border-[#22C35D]/50 [text-shadow:0_0_28px_rgba(34,195,93,0.5)]">Lucro</span>{" "}
                para Sua Loja!
              </motion.h1>

              <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-xl text-white/85 leading-relaxed max-w-xl">
                Com o Projeto Exclusivo JLBV, você aumenta o ticket médio, encanta o público feminino, estimula compras por impulso e se diferencia dos seus concorrentes.
              </motion.p>

              <motion.ul variants={staggerContainer} className="space-y-2.5">
                {[
                  "Compre direto da indústria com os melhores preços",
                  "Método exclusivo com inspiração internacional (EUA)",
                  "Vendedor silencioso: merchandising que vende sozinho",
                  "Acessórios que vendem, não só produtos parados no estoque",
                  "Crescimento mínimo garantido na categoria: 300%",
                ].map((bullet, idx) => (
                  <motion.li key={idx} variants={fadeUp} className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-[#22C35D] mt-0.5 flex-shrink-0" />
                    <span>{bullet}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={fadeUp} className="pt-2">
                <WhatsAppCTA text={noWhatsapp ? "Quero saber mais" : "Receber catálogo no WhatsApp"} size="large" onOpen={() => openModal("Hero — Receber catálogo")} noWhatsapp={noWhatsapp} />
                <p className="flex items-center justify-center sm:justify-start gap-1.5 text-white/60 text-xs sm:text-sm mt-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C35D] flex-shrink-0" />
                  +2.000 lojas já implantaram o projeto
                </p>
              </motion.div>
            </motion.div>

            {/* Imagens ou vídeo Hero — DESKTOP only */}
            {variant === "video1" ? (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="hidden lg:flex lg:flex-col lg:justify-center lg:items-center w-full gap-3">
                <div className="max-w-[320px] w-full">
                  <VideoEmbed
                    src="https://player.vimeo.com/video/1178399214?badge=0&autopause=0&player_id=0&app_id=58479"
                    title="Projeto JLBV — Supermercado"
                    autoplayMuted
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">
                    🛒 Supermercados
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs font-semibold text-white">
                    💊 Farmácias & Drogarias
                  </span>
                </div>
              </motion.div>
            ) : (
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="hidden lg:grid grid-cols-2 gap-5 w-full">
              <motion.div
                variants={fadeLeft}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl cursor-pointer hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-shadow"
                onClick={() => openLightbox(farmImages[0], "Projeto JLBV em Farmácias")}
              >
                <img src={farmImages[0]} alt="Projeto JLBV em Farmácias" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="eager" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3">
                  <p className="font-bold text-sm text-[#221B32]">Projeto JLBV</p>
                  <p className="text-xs text-[#E92085] font-semibold">Farmácias</p>
                </div>
              </motion.div>
              <motion.div
                variants={fadeRight}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mt-12 cursor-pointer hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-shadow"
                onClick={() => openLightbox(superImages[0], "Projeto JLBV em Supermercados")}
              >
                <img src={superImages[0]} alt="Projeto JLBV em Supermercados" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="eager" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3">
                  <p className="font-bold text-sm text-[#221B32]">Projeto JLBV</p>
                  <p className="text-xs text-[#704B9B] font-semibold">Supermercados</p>
                </div>
              </motion.div>
            </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 2: QUEM SOMOS ═══════════ */}
      <section className="py-8 sm:py-10 lg:py-14 bg-white">
        <div className="container">
          <AnimatedSection>
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <div className="w-full lg:w-1/2 relative">
                <div className="rounded-2xl overflow-hidden shadow-[0_8px_32px_-8px_rgba(112,75,155,0.15)]">
                  <img src={FACHADA_URL} alt="Galpão Life B — Polo Empresarial Goiás" className="w-full h-auto object-cover" loading="lazy" />
                </div>
                <div className="absolute -bottom-5 -right-3 sm:-bottom-6 sm:-right-6 bg-[#704B9B] rounded-2xl p-4 sm:p-6 shadow-[0_8px_32px_-8px_rgba(112,75,155,0.4)] hidden md:block">
                  <p className="text-white font-bold text-sm sm:text-base">Desde 2019</p>
                  <p className="text-white/80 text-xs sm:text-sm">Polo Empresarial Goiás</p>
                </div>
              </div>
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <SectionLabel text="Quem Somos" />
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221B32] mb-4 leading-snug">
                  A Life B é uma{" "}
                  <span className="text-[#E92085]">indústria líder</span>{" "}
                  no Centro-Oeste
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                  Instalada no Polo Empresarial Goiás, a Life B desenvolve projetos que aumentam suas vendas e encantam o consumidor com acessórios de saúde, higiene e beleza.
                </p>

                <motion.div
                  ref={statsRef}
                  initial="hidden"
                  animate={statsInView ? "visible" : "hidden"}
                  variants={staggerContainer}
                  className="grid grid-cols-2 gap-3 sm:gap-4 mb-6"
                >
                  {stats.map((stat, idx) => (
                    <motion.div key={idx} variants={scaleIn}>
                      <div className="text-center p-4 rounded-xl bg-white shadow-[0_8px_32px_-8px_rgba(112,75,155,0.15)] border border-gray-100">
                        <AnimatedCounter value={stat.value} prefix="+" suffix={stat.suffix} color={stat.color} inView={statsInView} />
                        <p className="text-xs sm:text-sm font-semibold text-[#221B32]">{stat.label}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-snug">{stat.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <WhatsAppCTA text={noWhatsapp ? "Quero saber mais" : "Quero receber o catálogo"} size="default" onOpen={() => openModal("Quem Somos — Receber catálogo")} noWhatsapp={noWhatsapp} />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 3: PROJETO JLBV — 6 Cards ═══════════ */}
      <section className="py-8 sm:py-10 lg:py-14 bg-gray-50">
        <div className="container">
          <AnimatedSection className="text-center mb-8 sm:mb-10">
            <SectionLabel text="Método Exclusivo" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221B32] mb-4">
              Conheça o Projeto <span className="text-[#E92085]">JLBV</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Um método exclusivo para aumentar o faturamento e o lucro da sua loja, se destacar da concorrência e encantar o principal público: as mulheres.
            </p>
          </AnimatedSection>

          <motion.div
            ref={benefitsRef}
            initial="hidden"
            animate={benefitsInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-12"
          >
            {jlbvBenefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div key={idx} variants={scaleIn}>
                  <div className="group p-5 sm:p-6 rounded-2xl bg-white shadow-[0_8px_32px_-8px_rgba(112,75,155,0.15)] hover:shadow-lg transition-all duration-300 border border-gray-100 h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#704B9B] to-[#E92085] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#221B32] mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed mb-2">{benefit.description}</p>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{benefit.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <AnimatedSection className="text-center">
            <WhatsAppCTA text="Falar com consultor" size="large" onOpen={() => openModal("Projeto JLBV — Falar com consultor")} noWhatsapp={noWhatsapp} />
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 4: RESULTADOS REAIS ═══════════ */}
      <section className="py-8 sm:py-10 lg:py-14 bg-white">
        <div className="container">
          <AnimatedSection className="text-center mb-8 sm:mb-10">
            <SectionLabel text="Resultados Reais" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221B32] mb-4">
              Quem implantou o JLBV <span className="text-[#E92085]">comprova</span>
            </h2>
          </AnimatedSection>

          {/* Vídeos depoimento */}
          <AnimatedSection className="mb-8 sm:mb-10">
            <div className="flex flex-row gap-4 sm:gap-6 items-start justify-center">
              {variant !== "video1" && (
                <div className="flex-1 max-w-[200px] sm:max-w-[280px]">
                  <VideoEmbed
                    src="https://player.vimeo.com/video/1178399214?badge=0&autopause=0&player_id=0&app_id=58479"
                    title="Projeto JLBV — Supermercado"
                  />
                  <p className="text-center text-sm font-bold mt-3 text-[#704B9B]">Supermercado</p>
                </div>
              )}
              <div className="flex-1 max-w-[200px] sm:max-w-[280px]">
                <VideoEmbed
                  src="https://www.youtube.com/embed/aOR4aUSp-zE?rel=0&modestbranding=1&enablejsapi=0&disablekb=1"
                  title="Projeto JLBV — Farmácia"
                />
                <p className="text-center text-sm font-bold mt-3 text-[#E92085]">Farmácia</p>
              </div>
            </div>
          </AnimatedSection>

          <motion.div
            ref={testimonialsRef}
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
          >
            {testimonials.map((t, idx) => (
              <motion.div key={idx} variants={scaleIn}>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_-8px_rgba(112,75,155,0.15)] border border-gray-100 h-full relative">
                  <div className="absolute top-5 right-6 text-gray-100">
                    <Quote className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-6 h-6 text-[#E92085]" />
                    <span className="text-4xl sm:text-5xl font-extrabold text-[#E92085]">{t.growth}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Antes</p>
                      <p className="text-sm sm:text-base font-bold text-gray-500">{t.before}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E92085] flex-shrink-0" />
                    <div className="flex-1 bg-[#E92085]/8 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-[#E92085] uppercase tracking-wide font-semibold mb-0.5">Depois</p>
                      <p className="text-sm sm:text-base font-bold text-[#221B32]">{t.after}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    {t.description.split(/(\bR\$\s*[\d.]+)/g).map((part, i) =>
                      /R\$/.test(part) ? <strong key={i} className="text-[#221B32]">{part}</strong> : part
                    )}
                  </p>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="font-bold text-sm text-[#221B32]">{t.company}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <AnimatedSection className="text-center mt-6 sm:mt-8">
            <WhatsAppCTA text="Quero esse resultado na minha loja" size="large" onOpen={() => openModal("Resultados — CTA")} noWhatsapp={noWhatsapp} />
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 5: GALERIA ═══════════ */}
      <section className="py-8 sm:py-10 lg:py-14 bg-white">
        <div className="container">
          <AnimatedSection className="text-center mb-8 sm:mb-10">
            <SectionLabel text="Na Prática" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221B32] mb-4">
              Veja o projeto JLBV <span className="text-[#E92085]">funcionando</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              O projeto Mega Vision USA organiza os acessórios de forma categorizada, otimiza espaços, maximiza a visibilidade e estimula compras por impulso.
            </p>
          </AnimatedSection>

          <AnimatedSection variants={scaleIn}>
            <div className="relative mb-6 md:max-w-4xl md:mx-auto">
              <div
                className="relative aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/10] max-h-[70vh] rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] bg-gray-100 cursor-pointer"
                onClick={() => openLightbox(allCarouselImages[currentSlide].src, `Gôndola Life B — ${allCarouselImages[currentSlide].label}`)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    src={allCarouselImages[currentSlide].src}
                    alt={`Gôndola Life B — ${allCarouselImages[currentSlide].label}`}
                    className="absolute inset-0 w-full h-full object-contain object-center bg-gray-50"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-1.5">
                  <span className="text-xs sm:text-sm font-bold text-[#704B9B]">{allCarouselImages[currentSlide].label}</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <p className="text-xs font-bold text-[#221B32] tabular-nums">{currentSlide + 1} / {allCarouselImages.length}</p>
                </div>
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-1.5 sm:hidden">
                  <Eye className="w-3.5 h-3.5 text-[#704B9B]" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                  <motion.div
                    className="h-full bg-[#E92085]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentSlide + 1) / allCarouselImages.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="absolute left-2 sm:left-3 md:-left-14 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#221B32] p-2.5 rounded-full shadow-lg z-10 transition-all hover:scale-105" aria-label="Imagem anterior">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="absolute right-2 sm:right-3 md:-right-14 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#221B32] p-2.5 rounded-full shadow-lg z-10 transition-all hover:scale-105" aria-label="Próxima imagem">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </AnimatedSection>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center sm:flex-wrap">
            {allCarouselImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  idx === currentSlide ? "border-[#E92085] shadow-md scale-105" : "border-gray-200 opacity-50 hover:opacity-80"
                }`}
                aria-label={`Ver imagem ${idx + 1} — ${img.label}`}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>

          {/* Badges */}
          <motion.div
            ref={galleryBulletsRef}
            initial="hidden"
            animate={galleryBulletsInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-3 sm:gap-4"
          >
            {[
              { label: "Mais exposição", icon: Eye },
              { label: "Mais giro do produto", icon: RefreshCw },
              { label: "Mais faturamento", icon: DollarSign },
              { label: "Mais lucro", icon: Gem },
            ].map((b, idx) => {
              const Icon = b.icon;
              return (
                <motion.div key={idx} variants={scaleIn}>
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-[0_4px_16px_-4px_rgba(112,75,155,0.12)] border border-gray-100">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#704B9B]" />
                    <span className="text-xs sm:text-sm font-semibold text-[#221B32]">{b.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <AnimatedSection className="text-center mt-6 sm:mt-8">
            <WhatsAppCTA text={noWhatsapp ? "Quero esse resultado na minha loja" : "Quero implantar na minha loja"} size="large" onOpen={() => openModal("Galeria — CTA")} noWhatsapp={noWhatsapp} />
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 6: FAQ ═══════════ */}
      <section className="py-8 sm:py-10 lg:py-14 bg-gray-50">
        <div className="container max-w-3xl">
          <AnimatedSection className="text-center mb-8 sm:mb-10">
            <SectionLabel text="Dúvidas Frequentes" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221B32] mb-4">
              Perguntas <span className="text-[#E92085]">Frequentes</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Tire suas dúvidas sobre o Projeto JLBV</p>
          </AnimatedSection>

          <AnimatedSection>
            <Accordion type="single" collapsible className="space-y-3">
              {faqData.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="bg-white border border-gray-200 rounded-2xl px-5 sm:px-6 overflow-hidden data-[state=open]:shadow-[0_8px_32px_-8px_rgba(112,75,155,0.15)] data-[state=open]:border-[#E92085]/30 transition-all duration-200"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-[#221B32] hover:text-[#704B9B] py-5 [&[data-state=open]]:text-[#704B9B] transition-colors">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>

          <AnimatedSection className="text-center mt-6 sm:mt-8">
            <p className="text-sm text-gray-500 mb-4">Ainda tem dúvidas? Fale diretamente com nosso consultor!</p>
            <WhatsAppCTA text={noWhatsapp ? "Falar com consultor" : "Tirar dúvidas no WhatsApp"} size="large" onOpen={() => openModal("FAQ — Tirar dúvidas")} noWhatsapp={noWhatsapp} />
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 7: CTA FINAL ═══════════ */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-[#704B9B] via-[#8B5FBF] to-[#E92085]">
        <AnimatedSection className="container text-center max-w-3xl">
          <img src={LOGO_URL} alt="Life B" className="h-12 sm:h-16 mx-auto mb-6 sm:mb-8 brightness-0 invert" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 sm:mb-6 leading-snug">
            Quer implantar o Projeto JLBV na sua loja?
          </h2>
          <p className="text-purple-200 text-sm sm:text-base md:text-lg mb-8 sm:mb-10">
            Fale agora com um consultor e receba uma proposta para o seu negócio.
          </p>
          <button onClick={() => openModal("CTA Final — Falar com consultor")} className="inline-block w-full sm:w-auto">
            <span className="inline-flex items-center justify-center gap-3 bg-[#22C35D] hover:bg-[#1dab52] text-white w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg md:text-xl rounded-full font-bold shadow-[0_8px_24px_-4px_rgba(233,32,133,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-4px_rgba(233,32,133,0.5)] active:scale-[0.98]">
              {noWhatsapp ? <Phone className="w-6 h-6 flex-shrink-0" /> : <WhatsAppIcon className="w-6 h-6 flex-shrink-0" />}
              <span>{noWhatsapp ? "Solicitar proposta" : "Falar com consultor agora"}</span>
            </span>
          </button>
          <p className="flex items-center justify-center gap-1.5 text-white/50 text-xs sm:text-sm mt-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C35D] flex-shrink-0" />
            +2.000 lojas já implantaram o projeto
          </p>
        </AnimatedSection>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-[#1a1625] text-gray-400 py-8 sm:py-10">
        <div className="container text-center">
          <img src={LOGO_URL} alt="Life B" className="h-10 sm:h-12 mx-auto mb-4 brightness-0 invert" />
          <p className="text-xs sm:text-sm text-gray-500 mb-1">LVL IMPORTADORA LTDA. | CNPJ: 33.751.598/0001-00</p>
          <p className="text-xs text-gray-600">&copy; 2026 Life B. Todos os direitos reservados.</p>
          <div className="mt-4">
            <button onClick={() => openModal("Footer — Telefone")} className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-white transition-colors">
              {noWhatsapp ? <Phone className="w-3.5 h-3.5 text-[#704B9B]" /> : <WhatsAppIcon className="w-3.5 h-3.5 text-[#22C35D]" />}
              (62) 99643-7218
            </button>
          </div>
        </div>
      </footer>

      {/* ═══════════ BOTÃO FLUTUANTE ═══════════ */}
      <motion.button
        onClick={() => openModal("Botão Flutuante")}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 180, damping: 12 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#22C35D] hover:bg-[#1dab52] text-white p-3.5 sm:p-4 rounded-full shadow-[0_8px_24px_-4px_rgba(233,32,133,0.4)]"
        aria-label="Abrir formulário"
      >
        {noWhatsapp ? <Phone className="w-6 h-6" /> : <WhatsAppIcon className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
