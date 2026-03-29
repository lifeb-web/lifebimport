import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, ChevronLeft, Package, Eye, TrendingUp, Zap, X, Maximize2, RefreshCw, DollarSign, Gem, CheckCircle2, Quote, Target, Smartphone } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

/*
 * ═══════════════════════════════════════════════════════════════
 * Landing Page B2B — Projeto JLBV Life B Import
 * Estilo: Referência lifeb-conecta-flow
 * Cores: Roxo #704B9B | Magenta #E92085 | Verde #22C35D | Texto #221B32
 * Tipografia: Montserrat
 * ═══════════════════════════════════════════════════════════════
 */

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/LifeB_78863297.png";
const FACHADA_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663443567391/DudyrJtvnPXoPe9sKXDH5u/Fachada_964752b2.webp";
const WHATSAPP_LINK = "https://wa.me/5562996437218?text=Ol%C3%A1%2C%20sou%20lojista%20e%20quero%20conhecer%20o%20projeto%20JLBV%20da%20Life%20B.";

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
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
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
function AnimatedCounter({ value, prefix = "+", color, inView }: {
  value: number; prefix?: string; color: string; inView: boolean;
}) {
  const count = useCountUp(value, 2200, inView);
  return (
    <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2 tabular-nums" style={{ color }}>
      {prefix}{count.toLocaleString("pt-BR")}
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

/* ─── Helper: dispara evento Meta Pixel ─── */
function trackWhatsApp() {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("trackCustom", "Contato_WhatsApp");
  }
}

/* ─── Helper: rastreia visualização de conteúdo ─── */
function trackViewContent(contentName: string, contentType: string = "section") {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "ViewContent", {
      content_name: contentName,
      content_type: contentType,
      content_ids: [contentName],
      value: 1.0,
      currency: "BRL"
    });
  }
}

/* ─── Hook: rastreia quando seção fica visível ─── */
function useTrackViewContent(contentName: string, threshold = 0.3) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  
  useEffect(() => {
    if (isInView) {
      trackViewContent(contentName);
    }
  }, [isInView, contentName]);
  
  return ref;
}

/* ─── Subtítulo de seção (padrão referência) ─── */
function SectionLabel({ text }: { text: string }) {
  return (
    <span className="inline-block text-xs sm:text-sm font-bold text-[#E92085] uppercase tracking-[0.2em] mb-3 sm:mb-4">
      {text}
    </span>
  );
}

/* ─── Botão CTA WhatsApp reutilizável (pill shape como referência) ─── */
function WhatsAppCTA({ text, size = "default" }: { text: string; size?: "default" | "large" }) {
  const base = "inline-flex items-center justify-center bg-[#22C35D] hover:bg-[#1dab52] active:bg-[#189a47] text-white font-bold gap-2.5 shadow-[0_8px_24px_-4px_rgba(233,32,133,0.4)] transition-all duration-200 hover:shadow-[0_12px_32px_-4px_rgba(233,32,133,0.5)] hover:-translate-y-0.5 rounded-full";
  const sizeClass = size === "large"
    ? "w-full sm:w-auto px-6 py-4 text-base sm:px-8 sm:py-4 sm:text-lg"
    : "w-full sm:w-auto px-5 py-3.5 text-sm sm:px-8 sm:py-4 sm:text-lg";

  return (
    <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="block sm:inline-block" onClick={trackWhatsApp}>
      <span className={base + " " + sizeClass}>
        <WhatsAppIcon className={size === "large" ? "w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" : "w-5 h-5 flex-shrink-0"} />
        <span className="leading-tight">{text}</span>
      </span>
    </a>
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
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors z-10"
        aria-label="Fechar"
      >
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
    detail: "Itens consagrados na internet migrados para lojas físicas, atendendo desejos latentes do público feminino — os \"Mimos Acessíveis\".",
  },
  {
    icon: Eye,
    title: "Exposição Estratégica",
    description: "Mega Vision USA — Mais visibilidade nas gôndolas.",
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
    description: "Antes da implantação do projeto JLBV a rede faturava R$ 27.000 em acessórios, atualmente está faturando R$ 160.000."
  },
  {
    before: "R$ 3.000", after: "R$ 12.000", growth: "300%",
    company: "Rede de Supermercado Super Couto", location: "Goiás",
    description: "Antes da implantação do projeto JLBV a rede faturava R$ 3.000 em acessórios, atualmente está faturando R$ 12.000."
  },
  {
    before: "R$ 15.000", after: "R$ 80.000", growth: "450%",
    company: "Rede de Drogarias Distrital", location: "Distrito Federal",
    description: "Antes da implantação do projeto JLBV a rede faturava R$ 15.000 em acessórios, atualmente está faturando R$ 80.000."
  },
];

const faqData = [
  {
    q: "O que é o Projeto JLBV?",
    a: "É um método exclusivo da Life B que organiza e expõe acessórios de forma estratégica nas gôndolas, utilizando a metodologia Mega Vision USA. Transforma espaços ociosos em pontos de alta rentabilidade, com crescimento mínimo de 300% na categoria.",
  },
  {
    q: "Qual o investimento e prazo de implantação?",
    a: "O investimento é acessível e proporcional ao tamanho da loja, com compra direta da indústria (sem intermediários). A implantação é rápida — em média poucos dias — sem interromper o funcionamento do estabelecimento.",
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
  { value: 1400, label: "SKUs", desc: "Mix completo em acessórios de saúde, higiene e beleza", color: "#704B9B" },
  { value: 500, label: "Lançamentos em 2026", desc: "Maior valor agregado e lucratividade", color: "#E92085" },
  { value: 2000, label: "Projetos Implantados", desc: "Em farmácias, supermercados e lojas de cosméticos", color: "#704B9B" },
  { value: 300, label: "% Crescimento Mínimo", desc: "Garantido na categoria de acessórios", color: "#E92085" },
];

/* ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState<{ src: string; alt: string } | null>(null);

  // Rastrear PageView ao carregar
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, []);

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

  // Refs para rastreamento de ViewContent (a partir de Quem Somos)
  const quemSomosRef = useTrackViewContent("Quem_Somos_Section", 0.3);
  const jlbvRef = useTrackViewContent("Projeto_JLBV_Section", 0.3);
  const galeriaRef = useTrackViewContent("Galeria_Section", 0.3);
  const casesRef = useTrackViewContent("Cases_Section", 0.3);
  const faqRef = useTrackViewContent("FAQ_Section", 0.3);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══════════ LIGHTBOX ═══════════ */}
      <AnimatePresence>
        {lightboxSrc && <Lightbox src={lightboxSrc.src} alt={lightboxSrc.alt} onClose={closeLightbox} />}
      </AnimatePresence>

      {/* ═══════════ HEADER ═══════════ */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
      >
        <div className="container flex items-center justify-between py-3">
          <img src={LOGO_URL} alt="Life B Import" className="h-8 sm:h-10 md:h-12 w-auto" />
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" onClick={trackWhatsApp}>
            <span className="inline-flex items-center gap-2 bg-[#22C35D] hover:bg-[#1dab52] text-white rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all hover:shadow-md shadow-[0_4px_12px_-2px_rgba(233,32,133,0.3)]">
              <WhatsAppIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Fale Conosco</span>
            </span>
          </a>
        </div>
      </motion.header>

      {/* ═══════════ SEÇÃO 1: HERO ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#704B9B] via-[#8B5FBF] to-[#E92085]">
        <div className="container py-10 sm:py-14 md:py-20 lg:py-28">

          {/* MOBILE: imagens aparecem primeiro */}
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

          {/* DESKTOP: layout lado a lado */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Conteúdo */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-5 lg:space-y-7">
              <motion.div variants={fadeUp} className="inline-block px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">Projeto Exclusivo JLBV</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] font-extrabold text-white leading-[1.1]">
                Transforme Acessórios em{" "}
                <span className="text-yellow-300">Lucro</span>{" "}
                para Sua Loja!
              </motion.h1>

              <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-xl text-white/85 leading-relaxed max-w-xl">
                Com o Projeto Exclusivo JLBV, você aumenta o ticket médio, encanta o público feminino, estimula compras por impulso e diferencia-se dos seus concorrentes.
              </motion.p>

              <motion.ul variants={staggerContainer} className="space-y-2.5">
                {[
                  "Compra direta da indústria com os melhores preços",
                  "Projeto JLBV — Inspiração internacional (EUA)",
                  "Vendedor silencioso, Merchandising inteligente",
                  "Nós entregamos soluções rentáveis, não apenas acessórios",
                  "Crescimento mínimo garantido na categoria: 300%",
                ].map((bullet, idx) => (
                  <motion.li key={idx} variants={fadeUp} className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                    <span>{bullet}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={fadeUp} className="pt-2">
                <WhatsAppCTA text="Receber catálogo no WhatsApp" size="large" />
              </motion.div>
            </motion.div>

            {/* Imagens Hero — DESKTOP only */}
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
          </div>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 2: QUEM SOMOS ═══════════ */}
      <section ref={quemSomosRef} className="py-10 sm:py-12 lg:py-16 bg-white">
        <div className="container">
          <AnimatedSection className="mb-10 sm:mb-16">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              {/* Foto da fachada com badge */}
              <div className="w-full lg:w-1/2 relative">
                <div className="rounded-2xl overflow-hidden shadow-[0_8px_32px_-8px_rgba(112,75,155,0.15)]">
                  <img src={FACHADA_URL} alt="Galpão Life B — Polo Empresarial Goiás" className="w-full h-auto object-cover" loading="lazy" />
                </div>
                {/* Badge sobreposto */}
                <div className="absolute -bottom-5 -right-3 sm:-bottom-6 sm:-right-6 bg-[#704B9B] rounded-2xl p-4 sm:p-6 shadow-[0_8px_32px_-8px_rgba(112,75,155,0.4)] hidden md:block">
                  <p className="text-white font-bold text-sm sm:text-base">Desde 2019</p>
                  <p className="text-white/80 text-xs sm:text-sm">Polo Empresarial Goiás</p>
                </div>
              </div>
              {/* Texto */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <SectionLabel text="Quem Somos" />
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221B32] mb-4 leading-snug">
                  A Life B é uma{" "}
                  <span className="text-[#E92085]">indústria líder</span>{" "}
                  no Centro-Oeste
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                  Instalada no Polo Empresarial Goiás, a Life B desenvolve projetos focados para escalar suas vendas e encantar os consumidores com acessórios de saúde, higiene e beleza.
                </p>

                {/* Métricas em grid 2x2 */}
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
                        <AnimatedCounter value={stat.value} prefix="+" color={stat.color} inView={statsInView} />
                        <p className="text-xs sm:text-sm font-semibold text-[#221B32]">{stat.label}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-snug">{stat.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <WhatsAppCTA text="Quero receber o catálogo" size="default" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 3: PROJETO JLBV — 6 Cards (3x2) ═══════════ */}
      <section ref={jlbvRef} className="py-10 sm:py-12 lg:py-16 bg-gray-50">
        <div className="container">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
            <SectionLabel text="Método Exclusivo" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221B32] mb-4">
              Conheça o Projeto <span className="text-[#E92085]">JLBV</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Um método exclusivo criado para escalar seu faturamento e lucratividade, diferenciando-se dos seus concorrentes e encantando o principal público da loja: as mulheres.
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
                  <div className="group p-6 sm:p-8 rounded-2xl bg-white shadow-[0_8px_32px_-8px_rgba(112,75,155,0.15)] hover:shadow-lg transition-all duration-300 border border-gray-100 h-full">
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
            <WhatsAppCTA text="Falar com consultor" size="large" />
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 4: GALERIA — Na Prática ═══════════ */}
      <section ref={galeriaRef} className="py-10 sm:py-12 lg:py-16 bg-white">
        <div className="container">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
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
              <div className="relative aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/10] max-h-[70vh] rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] bg-gray-100 cursor-pointer"
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

                {/* Label */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-1.5">
                  <span className="text-xs sm:text-sm font-bold text-[#704B9B]">
                    {allCarouselImages[currentSlide].label}
                  </span>
                </div>

                {/* Counter */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <p className="text-xs font-bold text-[#221B32] tabular-nums">
                    {currentSlide + 1} / {allCarouselImages.length}
                  </p>
                </div>

                {/* Expand hint mobile */}
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-1.5 sm:hidden">
                  <Eye className="w-3.5 h-3.5 text-[#704B9B]" />
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                  <motion.div
                    className="h-full bg-[#E92085]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentSlide + 1) / allCarouselImages.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Controles */}
              <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="absolute left-2 sm:left-3 md:-left-14 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#221B32] p-2.5 rounded-full shadow-lg z-10 transition-all hover:scale-105" aria-label="Imagem anterior">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="absolute right-2 sm:right-3 md:-right-14 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#221B32] p-2.5 rounded-full shadow-lg z-10 transition-all hover:scale-105" aria-label="Próxima imagem">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </AnimatedSection>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center sm:flex-wrap">
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

          {/* Badges inline */}
          <motion.div
            ref={galleryBulletsRef}
            initial="hidden"
            animate={galleryBulletsInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-3 sm:gap-4"
          >
            {[
              { label: "Mais exposição", icon: Maximize2 },
              { label: "Mais giro do produto", icon: RefreshCw },
              { label: "Mais faturamento", icon: DollarSign },
              { label: "Mais lucro", icon: Gem },
            ].map((b, idx) => {
              const BIcon = b.icon;
              return (
                <motion.div key={idx} variants={scaleIn}>
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-[0_4px_16px_-4px_rgba(112,75,155,0.12)] border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#22C35D]" />
                    <span className="text-xs sm:text-sm font-semibold text-[#221B32]">{b.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 5: RESULTADOS REAIS ═══════════ */}
      <section ref={casesRef} className="py-10 sm:py-12 lg:py-16 bg-gray-50">
        <div className="container">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
            <SectionLabel text="Resultados Reais" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221B32] mb-4">
              Quem implantou o JLBV <span className="text-[#E92085]">comprova</span>
            </h2>
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
                  {/* Aspas decorativas */}
                  <div className="absolute top-5 right-6 text-gray-100">
                    <Quote className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>

                  {/* Porcentagem grande */}
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-6 h-6 text-[#E92085]" />
                    <span className="text-4xl sm:text-5xl font-extrabold text-[#E92085]">{t.growth}</span>
                  </div>

                  {/* Descrição */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    {t.description.split(/(\bR\$\s*[\d.]+)/g).map((part, i) =>
                      /R\$/.test(part) ? <strong key={i} className="text-[#221B32]">{part}</strong> : part
                    )}
                  </p>

                  {/* Empresa */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="font-bold text-sm text-[#221B32]">{t.company}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 6: FAQ ═══════════ */}
      <section ref={faqRef} className="py-10 sm:py-12 lg:py-16 bg-white">
        <div className="container max-w-3xl">
          <AnimatedSection className="text-center mb-10 sm:mb-14">
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

          <AnimatedSection className="text-center mt-10 sm:mt-12">
            <p className="text-sm text-gray-500 mb-4">Ainda tem dúvidas? Fale diretamente com nosso consultor!</p>
            <WhatsAppCTA text="Tirar dúvidas no WhatsApp" size="large" />
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════ SEÇÃO 7: CTA FINAL ═══════════ */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-[#704B9B] via-[#8B5FBF] to-[#E92085]">
        <AnimatedSection className="container text-center max-w-3xl">
          <img src={LOGO_URL} alt="Life B" className="h-10 sm:h-14 mx-auto mb-6 sm:mb-8 brightness-0 invert" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 sm:mb-6 leading-snug">
            Quer implantar agora o projeto JLBV e garantir todos esses diferenciais estratégicos?
          </h2>
          <p className="text-purple-200 text-sm sm:text-base md:text-lg mb-8 sm:mb-10">
            Nossos consultores estão prontos para apresentar o projeto completo e ajudar sua loja a faturar mais.
          </p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-block w-full sm:w-auto" onClick={trackWhatsApp}>
            <span className="inline-flex items-center justify-center gap-3 bg-[#22C35D] hover:bg-[#1dab52] text-white w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg md:text-xl rounded-full font-bold shadow-[0_8px_24px_-4px_rgba(233,32,133,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-4px_rgba(233,32,133,0.5)]">
              <WhatsAppIcon className="w-6 h-6 flex-shrink-0" />
              <span>Falar com consultor agora</span>
            </span>
          </a>
        </AnimatedSection>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-[#1a1625] text-gray-400 py-10 sm:py-14">
        <div className="container text-center">
          <img src={LOGO_URL} alt="Life B" className="h-10 sm:h-12 mx-auto mb-4 brightness-0 invert" />
          <p className="text-xs sm:text-sm text-gray-500 mb-1">LVL IMPORTADORA LTDA. — CNPJ: 33.751.598/0001-00</p>
          <p className="text-xs text-gray-600">&copy; 2026 Life B. Todos os direitos reservados.</p>
          <div className="mt-4">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-white transition-colors" onClick={trackWhatsApp}>
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#22C35D]" />
              (62) 99643-7218
            </a>
          </div>
        </div>
      </footer>

      {/* ═══════════ BOTÃO FLUTUANTE WHATSAPP ═══════════ */}
      <motion.a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 180, damping: 12 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#22C35D] hover:bg-[#1dab52] text-white p-3.5 sm:p-4 rounded-full shadow-[0_8px_24px_-4px_rgba(233,32,133,0.4)]"
        aria-label="Abrir WhatsApp"
        onClick={trackWhatsApp}
      >
        <WhatsAppIcon className="w-6 h-6" />
      </motion.a>
    </div>
  );
}
