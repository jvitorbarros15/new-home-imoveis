// New Home Imóveis — section components

const SVG = ({ children, size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children}
  </svg>
);
const IconChev   = (p) => <SVG {...p}><polyline points="6 9 12 15 18 9" /></SVG>;
const IconArrow  = (p) => <SVG {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></SVG>;
const IconArrowL = (p) => <SVG {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></SVG>;
const IconSearch = (p) => <SVG {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></SVG>;
const IconFilter = (p) => <SVG {...p}><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="9" y2="18" /></SVG>;
const IconPhone  = (p) => <SVG {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></SVG>;
const IconPin    = (p) => <SVG {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></SVG>;
const IconBed    = (p) => <SVG {...p} size={p.size||14}><path d="M2 4v16M22 8H8a4 4 0 0 0-4 4v8M2 20h20M22 20V8" /></SVG>;
const IconBath   = (p) => <SVG {...p} size={p.size||14}><path d="M9 6V3a1 1 0 0 1 1-1h2M5 12V6h14v6M3 12h18l-1 6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" /></SVG>;
const IconCar    = (p) => <SVG {...p} size={p.size||14}><path d="M5 17h14M7 17v3M17 17v3M3 11l2-5h14l2 5M3 11h18v6H3z" /><circle cx="7.5" cy="14" r="1" /><circle cx="16.5" cy="14" r="1" /></SVG>;
const IconArea   = (p) => <SVG {...p} size={p.size||14}><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /></SVG>;
const IconIG     = (p) => <SVG {...p} size={14}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></SVG>;
const IconFB     = (p) => <SVG {...p} size={14}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></SVG>;
const IconWA     = (p) => <SVG {...p} size={14}><path d="M21 12a9 9 0 1 1-3.5-7.1L21 3l-1.4 4A9 9 0 0 1 21 12z" /><path d="M9 9c0 4 3 7 7 7l1.5-2-2.5-1-1 1c-1 0-3-2-3-3l1-1-1-2.5L9 9z" /></SVG>;
const IconMoon   = (p) => <SVG {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></SVG>;
const IconSun    = (p) => <SVG {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></SVG>;
const IconMenu   = (p) => <SVG {...p}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></SVG>;
const IconX      = (p) => <SVG {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></SVG>;

/* ------ Property data --------------------------------------------- */
const FEATURED = [
  {
    code: "AP9680-NHB",
    type: "Apartamento",
    title: "Apartamento decorado com vista para a lagoa",
    area: "133 m²", rooms: "3 Quartos", baths: "3", parking: "2 Vagas",
    region: "Barra da Tijuca · Rio de Janeiro",
    price: "R$ 2.290.000",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
  },
  {
    code: "AP0694-NHB",
    type: "Apartamento",
    title: "Apartamento com 3 quartos na Região Olímpica",
    area: "92 m²", rooms: "3 Quartos", baths: "3", parking: "1 Vaga",
    region: "Barra Olímpica · Rio de Janeiro",
    price: "R$ 1.100.000",
    externalUrl: NH.saleUrl,
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop",
  },
  {
    code: "AP9886-NHB",
    type: "Apartamento",
    title: "Apartamento com 3 quartos na Barra da Tijuca",
    area: "110 m²", rooms: "3 Quartos", baths: "3", parking: "2 Vagas",
    region: "Barra da Tijuca · Rio de Janeiro",
    price: "R$ 1.200.000",
    externalUrl: NH.saleUrl,
    img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80&auto=format&fit=crop",
  },
  {
    code: "AP9879-NHB",
    type: "Apartamento",
    title: "Apartamento com 4 quartos para venda ou locação",
    area: "136 m²", rooms: "4 Quartos", baths: "—", parking: "2 Vagas",
    region: "Barra Olímpica · Rio de Janeiro",
    price: "R$ 1.470.000",
    externalUrl: NH.inventoryUrl,
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop",
  },
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=72&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=72&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=72&auto=format&fit=crop",
];

const BAIRROS = [
  { name: "Barra da Tijuca", url: `${NH.saleUrl}/apartamento/rio-de-janeiro/barra-da-tijuca`, img: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=720&q=68&auto=format&fit=crop" },
  { name: "Barra Olímpica", url: `${NH.saleUrl}/apartamento/rio-de-janeiro/barra-olimpica`, img: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=720&q=68&auto=format&fit=crop" },
  { name: "Recreio dos Bandeirantes", url: `${NH.saleUrl}/rio-de-janeiro/recreio-dos-bandeirantes`, img: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=720&q=68&auto=format&fit=crop" },
  { name: "Jacarepaguá", url: `${NH.saleUrl}/rio-de-janeiro/jacarepagua`, img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=720&q=68&auto=format&fit=crop" },
  { name: "Ilha Pura", url: `${NH.inventoryUrl}/rio-de-janeiro/ilha-pura`, img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=720&q=68&auto=format&fit=crop" },
  { name: "Lagoa", url: `${NH.saleUrl}/apartamento/rio-de-janeiro/lagoa`, img: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=720&q=68&auto=format&fit=crop" },
  { name: "Rio 2", url: `${NH.inventoryUrl}/rio-de-janeiro/rio-2`, img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=720&q=68&auto=format&fit=crop" },
];

const SERVICE_PILLARS = [
  { title: "Atendimento exclusivo", text: "Uma equipe preparada para entender o perfil do cliente e conduzir cada etapa com atenção." },
  { title: "Estratégia digital", text: "Marketing imobiliário para aproximar proprietários, construtoras e compradores qualificados." },
  { title: "Processo acompanhado", text: "Apoio em contratos, documentação e eventual assessoria jurídica e de financiamento." },
];

function officialSearchUrl({ pretensao, tipo, busca }) {
  const clean = (busca || "").trim();
  if (/^[A-Z]{2}\d{4}-NHB$/i.test(clean)) {
    return `${NH.inventoryUrl}?codigo=${encodeURIComponent(clean.toUpperCase())}`;
  }

  const purpose = pretensao === "Alugar" ? "para-alugar" : pretensao === "Comprar" ? "a-venda" : "";
  const typeMap = {
    Apartamento: "apartamento",
    Cobertura: "cobertura",
    Casa: "casa",
    "Casa em condomínio": "casa",
    Terreno: "terreno",
    Comercial: "sala",
  };
  const locationMap = {
    "barra da tijuca": "barra-da-tijuca",
    "barra olímpica": "barra-olimpica",
    "recreio dos bandeirantes": "recreio-dos-bandeirantes",
    recreio: "recreio-dos-bandeirantes",
    jacarepaguá: "jacarepagua",
    lagoa: "lagoa",
    "ilha pura": "ilha-pura",
    "rio 2": "rio-2",
  };
  const parts = [NH.inventoryUrl, purpose, typeMap[tipo] || ""].filter(Boolean);
  const location = locationMap[clean.toLocaleLowerCase("pt-BR")];
  if (location) parts.push("rio-de-janeiro", location);
  return parts.join("/");
}

/* ------ Helpers --------------------------------------------------- */
function useTheme() {
  const [theme, setTheme] = React.useState(() => {
    try { return localStorage.getItem("nh-theme") || "dark"; } catch { return "dark"; }
  });
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("nh-theme", theme); } catch {}
  }, [theme]);
  const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");
  return [theme, toggle];
}

function useReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

function CountUp({ to, suffix = "" }) {
  return <span>{to.toLocaleString("pt-BR")}{suffix}</span>;
}

/* ------ Nav ------------------------------------------------------- */
function Nav({ brand }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [theme, toggleTheme] = useTheme();
  const currentPage = (window.location.pathname.split("/").pop() || "index").replace(/\.html$/, "");

  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 40);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const navLinks = [
    { href: "index.html#destaques", label: "Imóveis",      page: "index" },
    { href: "index.html#bairros",   label: "Bairros",       page: "index" },
    { href: "financiamento.html",   label: "Financiamento", page: "financiamento" },
    { href: "quem-somos.html",      label: "Quem somos",    page: "quem-somos" },
    { href: "index.html#contato",   label: "Contato",       page: "index" },
  ];

  return (
    <>
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <a className="nav-logo" href="index.html">
          <img src={brand === "insignia" ? "assets/logo-navy.jpg" : "assets/logo-gold.png"} alt="New Home Imóveis" />
        </a>
        <div className="nav-links">
          {navLinks.map(({ href, label, page }) => (
            <a key={label} href={href} className={currentPage === page ? "active" : ""}>{label}</a>
          ))}
        </div>
        <div className="nav-actions">
          <button
            className="nav-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
          <a className="nav-phone" href={`tel:${NH.primaryPhone}`}>
            <IconPhone /> {NH.primaryPhoneDisplay}
          </a>
          <a className="nav-cta" href={NH.listPropertyUrl}>Anuncie seu imóvel</a>
          <button
            className="nav-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            <IconMenu size={18} />
          </button>
        </div>
      </nav>

      <div className={`nav-mobile ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen} role="dialog" aria-modal={menuOpen || undefined} aria-label="Menu principal">
        <button className="nav-mobile-close" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" tabIndex={menuOpen ? 0 : -1}>
          <IconX size={20} />
        </button>
        {navLinks.map(({ href, label, page }) => (
          <a key={label} href={href}
             className={currentPage === page ? "active" : ""}
             onClick={() => setMenuOpen(false)}
             tabIndex={menuOpen ? 0 : -1}
          >{label}</a>
        ))}
        <a className="nav-mobile-cta" href={NH.listPropertyUrl} onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>
          Anuncie seu imóvel
        </a>
      </div>
    </>
  );
}

/* ------ Hero ------------------------------------------------------ */
function Hero({ motion }) {
  const [idx, setIdx] = React.useState(0);
  const [loadedSlides, setLoadedSlides] = React.useState(() => new Set([0]));
  const [pretensao, setPretensao] = React.useState("Comprar");
  const [tipo, setTipo] = React.useState("Apartamento");
  const [busca, setBusca] = React.useState("");
  const [openP, setOpenP] = React.useState(false);
  const [openT, setOpenT] = React.useState(false);

  React.useEffect(() => {
    if (motion === "off") return;
    const id = setInterval(() => setIdx(i => (i + 1) % HERO_IMAGES.length), 5500);
    return () => clearInterval(id);
  }, [motion]);

  React.useEffect(() => {
    const targets = [idx, (idx + 1) % HERO_IMAGES.length];
    const images = [];
    const load = () => {
      targets.forEach((target) => {
        if (loadedSlides.has(target)) return;
        const image = new Image();
        image.decoding = "async";
        image.onload = () => setLoadedSlides((current) => new Set([...current, target]));
        image.src = HERO_IMAGES[target];
        images.push(image);
      });
    };
    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 600));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const handle = schedule(load);
    return () => {
      cancel(handle);
      images.forEach((image) => { image.onload = null; });
    };
  }, [idx]);

  // close popovers on outside click
  React.useEffect(() => {
    const close = (e) => { if (!e.target.closest(".hs-field")) { setOpenP(false); setOpenT(false); } };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const PRETENSOES = ["Comprar", "Alugar", "Lançamentos"];
  const TIPOS = ["Apartamento", "Cobertura", "Casa", "Casa em condomínio", "Terreno", "Comercial"];
  const submitSearch = (e) => {
    e.preventDefault();
    window.location.href = officialSearchUrl({ pretensao, tipo, busca });
  };

  return (
    <header className="hero">
      <div className="hero-slides">
        {HERO_IMAGES.map((src, i) => (
          <div key={i} className={`hero-slide ${i === idx ? "active" : ""}`}
               style={{ backgroundImage: loadedSlides.has(i) ? `url(${src})` : "none" }} />
        ))}
        <div className="hero-veil" />
      </div>

      <div className="hero-side">
        {HERO_IMAGES.map((_, i) => (
          <button key={i} type="button" className={`hero-dot ${i === idx ? "on" : ""}`} onClick={() => setIdx(i)} aria-label={`Mostrar imagem ${i + 1}`} aria-pressed={i === idx} />
        ))}
        <div className="hero-counter">{String(idx + 1).padStart(2, "0")} / {String(HERO_IMAGES.length).padStart(2, "0")}</div>
      </div>

      <div className="hero-content">
        <div className="hero-headline">
          <div className="hero-eyebrow"><span className="eyebrow">New Home · Imóveis selecionados</span></div>
          <h1>
            <span className="kw"><span style={{ animationDelay: "0.05s" }}>Imóveis</span></span>{" "}
            <span className="kw"><span style={{ animationDelay: "0.12s" }}>escolhidos</span></span>{" "}
            <span className="kw"><span style={{ animationDelay: "0.19s" }}>para</span></span>{" "}
            <span className="kw"><span style={{ animationDelay: "0.26s" }}>quem</span></span>{" "}
            <br />
            <span className="kw"><span style={{ animationDelay: "0.34s" }}>busca</span></span>{" "}
            <em><span className="kw"><span style={{ animationDelay: "0.42s" }}>qualidade</span></span>{" "}
            <span className="kw"><span style={{ animationDelay: "0.50s" }}>de vida.</span></span></em>
          </h1>
          <p className="hero-sub">
            Desde 2010 no Rio de Janeiro, conectando compradores e proprietários com atendimento exclusivo,
            estratégia digital e acompanhamento em cada etapa do negócio.
          </p>
        </div>

        <form className="hero-search" onSubmit={submitSearch}>
          <div className="hs-field" role="button" tabIndex="0" aria-haspopup="listbox" aria-expanded={openP}
               onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenP(o => !o); setOpenT(false); } }}
               onClick={(e) => { e.stopPropagation(); setOpenP(o => !o); setOpenT(false); }}>
            <span className="hs-label">Pretensão</span>
            <span className="hs-value">{pretensao}<IconChev className="hs-chev" /></span>
            {openP && (
              <div className="hs-pop" onClick={(e) => e.stopPropagation()}>
                {PRETENSOES.map(p => (
                  <button type="button" key={p} className={p === pretensao ? "on" : ""}
                          onClick={() => { setPretensao(p); setOpenP(false); }}>{p}</button>
                ))}
              </div>
            )}
          </div>
          <div className="hs-field" role="button" tabIndex="0" aria-haspopup="listbox" aria-expanded={openT}
               onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenT(o => !o); setOpenP(false); } }}
               onClick={(e) => { e.stopPropagation(); setOpenT(o => !o); setOpenP(false); }}>
            <span className="hs-label">Tipo de imóvel</span>
            <span className="hs-value">{tipo}<IconChev className="hs-chev" /></span>
            {openT && (
              <div className="hs-pop" onClick={(e) => e.stopPropagation()}>
                {TIPOS.map(p => (
                  <button type="button" key={p} className={p === tipo ? "on" : ""}
                          onClick={() => { setTipo(p); setOpenT(false); }}>{p}</button>
                ))}
              </div>
            )}
          </div>
          <div className="hs-field">
            <span className="hs-label">Localização</span>
            <span className="hs-value">
              <IconSearch size={14} />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Bairro, condomínio ou código" aria-label="Localização ou código do imóvel" />
            </span>
          </div>
          <button type="button" className="hs-filter" onClick={() => { window.location.href = NH.inventoryUrl; }}><IconFilter size={14} /> Mais filtros</button>
          <button type="submit" className="hs-btn">Encontrar <IconArrow size={14} /></button>
        </form>
      </div>

      <div className="hero-scroll">Role para descobrir</div>
    </header>
  );
}

/* ------ Destaques ------------------------------------------------- */
function Destaques() {
  const [tab, setTab] = React.useState("Venda");
  const [hover, setHover] = React.useState(0);
  const [items, setItems] = React.useState(FEATURED);

  React.useEffect(() => {
    if (!window.sb) return;
    window.sb
      .from("properties")
      .select("code,title,type,region,price_brl,area_m2,bedrooms,bathrooms,parking,images,status")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setItems(data.map(p => ({
            type:    p.type,
            title:   p.title,
            area:    p.area_m2 ? `${p.area_m2} m²` : "—",
            rooms:   p.bedrooms ? `${p.bedrooms} Quartos` : "—",
            baths:   p.bathrooms ? String(p.bathrooms) : "—",
            parking: p.parking ? `${p.parking} Vagas` : "—",
            region:  p.region,
            price:   "R$ " + (p.price_brl / 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 }),
            img:     p.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
            code:    p.code,
          })));
          setHover(0);
        }
      });
  }, []);

  const featured = items[hover] || items[0];

  return (
    <section id="destaques" className="reveal">
      <div className="sec-head">
        <h2>Destaques da <em>curadoria</em></h2>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 18 }}>
          <p>Uma seleção mensal de propriedades que combinam localização, projeto e singularidade.</p>
          <div className="seg">
            {["Venda", "Aluguel", "Lançamentos"].map(t => (
              <button key={t} className={tab === t ? "on" : ""} onClick={() => {
                setTab(t);
                window.location.href = t === "Venda" ? NH.saleUrl : t === "Aluguel" ? NH.rentUrl : NH.inventoryUrl;
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="destaques">
        <a className="dest-hero dest-hero-link" href={featured?.externalUrl || `imovel.html?code=${encodeURIComponent(featured?.code || "")}`}>
          <div className="img" style={{ backgroundImage: `url("${featured?.img}")` }} />
          <div className="meta">
            <div>
              <div className="dest-tag">{featured?.type} · {featured?.region}</div>
              <h3>{featured?.title}</h3>
              <div className="dest-specs">
                <span><IconArea /> {featured?.area}</span>
                <span><IconBed /> {featured?.rooms}</span>
                <span><IconBath /> {featured?.baths} Banhos</span>
                <span><IconCar /> {featured?.parking}</span>
              </div>
            </div>
            <div className="dest-price">
              <small>A partir de</small>
              {featured?.price}
            </div>
          </div>
        </a>

        <div className="dest-list">
          {items.slice(1, 4).map((p, i) => (
            <a key={p.code || i} className="dest-card" href={p.externalUrl || `imovel.html?code=${encodeURIComponent(p.code || "")}`}
               onMouseEnter={() => setHover(i + 1)}
               onFocus={() => setHover(i + 1)}>
              <div className="dc-imgwrap"><div className="dc-img" style={{ backgroundImage: `url("${p.img}")` }} /></div>
              <div className="dc-body">
                <div>
                  <div className="dc-type">{p.type} · {p.region.split(" · ")[0]}</div>
                  <div className="dc-title">{p.title}</div>
                  <div className="dc-specs">
                    <span><IconArea /> {p.area}</span>
                    <span><IconBed /> {p.rooms}</span>
                    <span><IconCar /> {p.parking}</span>
                  </div>
                </div>
                <div className="dc-price">{p.price}</div>
              </div>
              <div className="dc-arrow"><IconArrow size={12} /></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------ Bairros --------------------------------------------------- */
function Bairros() {
  const railRef = React.useRef(null);
  const scroll = (dir) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({ left: dir * 380, behavior: "smooth" });
  };
  return (
    <section id="bairros" className="bairros reveal" style={{ maxWidth: "100%" }}>
      <div className="bairros-wrap">
        <div className="sec-head">
          <h2>O Rio em <em>bairros</em></h2>
          <p>Conheça as regiões em que a New Home atua. Da orla à floresta — cada bairro com a sua narrativa.</p>
        </div>
        <div className="bairros-rail" ref={railRef}>
          {BAIRROS.map((b, i) => (
            <a key={i} className="bairro" href={b.url} aria-label={`Ver imóveis em ${b.name}`}>
              <img className="img" src={b.img} alt="" loading="lazy" decoding="async" />
              <div className="grad" />
              <div className="pin"><IconPin size={14} /></div>
              <div className="label">
                <h4>{b.name}</h4>
                <span className="ct">Ver imóveis</span>
              </div>
            </a>
          ))}
        </div>
        <div className="rail-nav">
          <button onClick={() => scroll(-1)} aria-label="anterior"><IconArrowL size={16} /></button>
          <button onClick={() => scroll(1)} aria-label="próximo"><IconArrow size={16} /></button>
        </div>
      </div>
    </section>
  );
}

/* ------ Stats ----------------------------------------------------- */
function Stats() {
  const years = new Date().getFullYear() - NH.foundedYear;
  return (
    <section className="stats reveal" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div className="stat">
        <div className="num"><CountUp to={years} /><em>anos</em></div>
        <div className="lbl">Atuação no mercado imobiliário desde 2010</div>
      </div>
      <div className="stat">
        <div className="num">R$<CountUp to={600} /><em>mi+</em></div>
        <div className="lbl">Em vendas informadas pela New Home</div>
      </div>
      <div className="stat">
        <div className="num">Barra</div>
        <div className="lbl">Barra da Tijuca, Recreio e Região Olímpica</div>
      </div>
      <div className="stat">
        <div className="num">7609 J</div>
        <div className="lbl">Registro da imobiliária no CRECI-RJ</div>
      </div>
    </section>
  );
}

/* ------ Sobre ----------------------------------------------------- */
function Sobre() {
  return (
    <section id="sobre" className="sobre reveal">
      <div className="sobre-img" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80&auto=format&fit=crop)" }} />
      <div className="sobre-body">
        <span className="eyebrow">A New Home</span>
        <h2 style={{ marginTop: 20 }}>Curadoria <em>imobiliária</em> com o tempo de quem mora aqui.</h2>
        <p>
          Desde 2010, a New Home Imóveis atua na intermediação de empreendimentos na Barra da Tijuca,
          Recreio e região. O trabalho combina atendimento diferenciado, estratégia de marketing digital
          e uma equipe preparada para aproximar imóveis e compradores qualificados.
        </p>
        <div className="sobre-quote">
          Mais de R$ 600 milhões em vendas e milhares de clientes atendidos, segundo dados publicados pela empresa.
        </div>
        <div className="sobre-sig">
          <span className="line" />
          New Home Imóveis · CRECI {NH.creci}
        </div>
      </div>
    </section>
  );
}

/* ------ Depoimentos ----------------------------------------------- */
function Depoimentos() {
  return (
    <section id="depoimentos" className="reveal">
      <div className="sec-head">
        <h2>Um processo <em>bem acompanhado</em></h2>
        <p>Da divulgação à documentação, a equipe atua para tornar a negociação mais clara e segura.</p>
      </div>
      <div className="depo-track">
        {SERVICE_PILLARS.map((item, i) => (
          <div key={i} className="depo-card">
            <div className="depo-mark">{String(i + 1).padStart(2, "0")}</div>
            <div className="depo-quote">{item.text}</div>
            <div className="depo-by">
              <span className="depo-name">{item.title}</span>
              <span className="depo-place">New Home Imóveis</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------ CTA ------------------------------------------------------- */
function CTA() {
  const submit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const message = [
      "Olá! Gostaria de atendimento da New Home Imóveis.",
      `Nome: ${data.get("name")}`,
      `WhatsApp: ${data.get("phone")}`,
      `E-mail: ${data.get("email")}`,
      `Interesse: ${data.get("interest")}`,
    ].join("\n");
    window.open(NH.whatsapp(message), "_blank", "noopener,noreferrer");
  };
  return (
    <section id="contato" className="cta reveal" style={{ maxWidth: "100%" }}>
      <div className="cta-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80&auto=format&fit=crop)" }} />
      <div className="cta-body">
        <span className="eyebrow">Atendimento personalizado</span>
        <h2 style={{ marginTop: 20 }}>Vamos encontrar a <em>sua</em> nova casa.</h2>
        <p>Conte para nós o que procura — região, perfil, momento de vida. Um consultor da New Home retornará
          com uma seleção desenhada para você, em até um dia útil.</p>
      </div>
      <form className="cta-form" onSubmit={submit}>
        <h3>Fale com um consultor</h3>
        <label>Nome<input name="name" required autoComplete="name" placeholder="Como prefere ser chamado" /></label>
        <label>WhatsApp<input name="phone" type="tel" required autoComplete="tel" placeholder="(21) 99999-9999" /></label>
        <label>E-mail<input name="email" type="email" required autoComplete="email" placeholder="seu@email.com" /></label>
        <label>O que procura?
          <select name="interest" defaultValue="" required>
            <option value="" disabled>Selecione</option>
            <option>Comprar imóvel</option>
            <option>Alugar imóvel</option>
            <option>Anunciar imóvel</option>
            <option>Investir</option>
          </select>
        </label>
        <label className="cta-consent">
          <input name="consent" type="checkbox" required />
          <span>Concordo com a <a href={NH.privacyUrl} target="_blank" rel="noopener noreferrer">política de privacidade</a> e autorizo o contato.</span>
        </label>
        <button type="submit">Solicitar contato</button>
      </form>
    </section>
  );
}

/* ------ Footer ---------------------------------------------------- */
function Footer({ brand }) {
  return (
    <footer>
      <div className="ft-grid">
        <div className="ft-brand">
          <img src={brand === "insignia" ? "assets/logo-navy.jpg" : "assets/logo-gold.png"} alt="New Home Imóveis" />
          <p>Desde 2010 intermediando imóveis na Barra da Tijuca, Recreio e Região Olímpica.</p>
        </div>
        <div className="ft-col">
          <h5>Navegue</h5>
          <ul>
            <li><a href="index.html#destaques">Imóveis em destaque</a></li>
            <li><a href="index.html#bairros">Por bairro</a></li>
            <li><a href={NH.saleUrl}>Imóveis à venda</a></li>
            <li><a href={NH.rentUrl}>Imóveis para alugar</a></li>
          </ul>
        </div>
        <div className="ft-col">
          <h5>Institucional</h5>
          <ul>
            <li><a href="quem-somos.html">Quem somos</a></li>
            <li><a href="financiamento.html">Financiamento</a></li>
            <li><a href={NH.listPropertyUrl}>Cadastre seu imóvel</a></li>
            <li><a href={NH.privacyUrl}>Política de privacidade</a></li>
          </ul>
        </div>
        <div className="ft-col">
          <h5>Contato</h5>
          <ul>
            <li><a href={`tel:${NH.primaryPhone}`}>{NH.primaryPhoneDisplay}</a></li>
            <li><a href={`mailto:${NH.email}`}>{NH.email}</a></li>
            <li><a href={NH.mapUrl}>Av. Embaixador Abelardo Bueno, 3500 · Sala 1022</a></li>
            <li><span>CRECI {NH.creci}</span></li>
          </ul>
        </div>
      </div>
      <div className="ft-bot">
        <span>© {new Date().getFullYear()} New Home Imóveis · Todos os direitos reservados</span>
        <div className="ft-social">
          <a href={NH.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconIG /></a>
          <a href={NH.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><IconFB /></a>
          <a href={NH.whatsapp()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><IconWA /></a>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, Hero, Destaques, Bairros, Stats, Sobre, Depoimentos, CTA, Footer, useReveal, useTheme, SVG });
