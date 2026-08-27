// New Home — Imóvel page sections

function waLink(prop) {
  const msg = encodeURIComponent(
    `Olá! Tenho interesse no imóvel ${prop.code} — ${prop.title} (${prop.address.split("·")[1].trim()}), R$ ${(prop.price/1000000).toFixed(1)}M. Gostaria de mais informações.`
  );
  return `https://wa.me/5521997220589?text=${msg}`;
}

/* ------ Property data --------------------------------------------- */
const PROP = {
  code: "AP9830-NHB",
  status: "À venda",
  type: "Apartamento",
  title: "Apartamento à beira da Lagoa, com vista para o Cristo",
  address: "Av. Epitácio Pessoa · Lagoa · Rio de Janeiro / RJ",
  price: 1950000,
  condominio: 3579,
  iptu: 800,
  m2Value: 17257,
  specs: {
    areaUtil: 113, areaBruta: 113, quartos: 2, suites: 1, banheiros: 2, vagas: 1, pet: true,
  },
  description: [
    "Apartamento à venda na Av. Epitácio Pessoa, em frente à Lagoa Rodrigo de Freitas — um dos endereços mais cobiçados do Rio de Janeiro. Edifício de alto padrão com lazer completo, vista frontal espetacular e luz natural durante todo o dia.",
    "Living amplo integrado ao terraço, dois dormitórios (sendo uma suíte ampla com closet), cozinha planejada com área de serviço independente, dependência reversível e uma vaga demarcada. Pronto para morar.",
  ],
  highlights: [
    { icon: "view", title: "Vista frontal da Lagoa", desc: "Janelas amplas voltadas ao espelho d'água e ao Cristo Redentor." },
    { icon: "sun",  title: "Sol da manhã o dia todo", desc: "Orientação privilegiada, luz natural e ventilação cruzada." },
    { icon: "key",  title: "Pronto para morar", desc: "Reformado em 2024, com cozinha e banheiros planejados." },
  ],
  features: {
    "Interior": ["Ar condicionado split", "Armários cozinha", "Armários quartos", "Armários banheiro", "Closet na suíte", "Cozinha planejada", "Despensa", "Varanda integrada", "Área de serviço", "Piso em porcelanato", "Dependência reversível"],
    "Edifício": ["Portaria 24h", "Elevadores sociais (2)", "Elevador de serviço", "Garagem coberta", "Bicicletário", "Vista frontal Lagoa", "Frente do prédio"],
    "Lazer": ["Piscina adulto e infantil", "Academia", "Sauna seca e a vapor", "Salão de festas", "Salão de jogos", "Playground", "Churrasqueira", "Espaço gourmet"],
    "Segurança": ["Portaria 24h", "CFTV em áreas comuns", "Acesso por biometria", "Interfone", "Cerca elétrica"],
  },
  nearby: [
    { name: "Lagoa Rodrigo de Freitas", cat: "Lazer · Pista", dist: "120 m" },
    { name: "Parque da Catacumba", cat: "Lazer · Trilha", dist: "450 m" },
    { name: "Jardim Botânico", cat: "Lazer · Parque", dist: "1,4 km" },
    { name: "Shopping Leblon", cat: "Compras", dist: "1,8 km" },
    { name: "Praia de Ipanema", cat: "Praia", dist: "900 m" },
    { name: "Colégio Santo Agostinho", cat: "Educação", dist: "650 m" },
    { name: "Hospital Copa D'Or", cat: "Saúde", dist: "2,2 km" },
  ],
  images: [
    { src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80&auto=format&fit=crop", caption: "Living integrado ao terraço", room: "Sala de estar" },
    { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80&auto=format&fit=crop", caption: "Vista frontal da Lagoa", room: "Varanda" },
    { src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80&auto=format&fit=crop", caption: "Sala de jantar", room: "Sala" },
    { src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80&auto=format&fit=crop", caption: "Cozinha planejada", room: "Cozinha" },
    { src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&q=80&auto=format&fit=crop", caption: "Suíte master com closet", room: "Suíte" },
    { src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1600&q=80&auto=format&fit=crop", caption: "Banheiro com acabamento em mármore", room: "Banheiro" },
    { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80&auto=format&fit=crop", caption: "Segundo dormitório", room: "Quarto" },
    { src: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1600&q=80&auto=format&fit=crop", caption: "Vista panorâmica do edifício", room: "Fachada" },
    { src: "https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=1600&q=80&auto=format&fit=crop", caption: "Piscina do condomínio", room: "Lazer" },
  ],
  tourUrl: null, // Set to a Matterport share URL when available
  agent: {
    name: "Erick Leonardo", creci: "51507", phone: "+5521997220589", phoneDisplay: "(21) 99722-0589",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&auto=format&fit=facearea&facepad=2",
    rating: 4.9, reviews: 142,
  },
  similar: [
    { code: "CO0921", type: "Cobertura", title: "Cobertura duplex com piscina privativa", region: "Lagoa", area: 240, rooms: 3, parking: 2, price: 4500000, img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80&auto=format&fit=crop", tag: "Novo" },
    { code: "AP8842", type: "Apartamento", title: "Apartamento clássico em Ipanema", region: "Ipanema", area: 138, rooms: 3, parking: 1, price: 2780000, img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80&auto=format&fit=crop" },
    { code: "AP7715", type: "Apartamento", title: "Reformado com varanda gourmet", region: "Leblon", area: 96, rooms: 2, parking: 1, price: 1880000, img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80&auto=format&fit=crop" },
    { code: "AP9015", type: "Apartamento", title: "Pé direito alto, frente Lagoa", region: "Lagoa", area: 124, rooms: 2, parking: 1, price: 2100000, img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=80&auto=format&fit=crop", tag: "Destaque" },
    { code: "AP8112", type: "Apartamento", title: "Vista para o Cristo", region: "Humaitá", area: 102, rooms: 2, parking: 1, price: 1650000, img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80&auto=format&fit=crop" },
  ],
};

const BRL = (n) => "R$ " + n.toLocaleString("pt-BR");
const BRLk = (n) => "R$ " + Math.round(n).toLocaleString("pt-BR");

const I = {
  Area:   (p) => <SVG {...p}><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /></SVG>,
  Bed:    (p) => <SVG {...p}><path d="M2 4v16M22 8H8a4 4 0 0 0-4 4v8M2 20h20M22 20V8" /></SVG>,
  Bath:   (p) => <SVG {...p}><path d="M9 6V3a1 1 0 0 1 1-1h2M5 12V6h14v6M3 12h18l-1 6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" /></SVG>,
  Car:    (p) => <SVG {...p}><path d="M5 17h14M7 17v3M17 17v3M3 11l2-5h14l2 5M3 11h18v6H3z" /><circle cx="7.5" cy="14" r="1" /><circle cx="16.5" cy="14" r="1" /></SVG>,
  Suite:  (p) => <SVG {...p}><path d="M3 6v14M21 6v14M3 11h18M5 6h14v5H5z" /></SVG>,
  Pet:    (p) => <SVG {...p}><circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="20" cy="14" r="2" /><circle cx="4" cy="14" r="2" /><path d="M16 17a4 4 0 0 1-8 0v-2a4 4 0 0 1 8 0z" /></SVG>,
  View:   (p) => <SVG {...p}><circle cx="12" cy="12" r="3" /><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z" /></SVG>,
  Sun:    (p) => <SVG {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></SVG>,
  Key:    (p) => <SVG {...p}><circle cx="7" cy="14" r="4" /><path d="M11 14h11l-3 3M16 17v3" /></SVG>,
  Check:  (p) => <SVG {...p} size={p.size || 10}><polyline points="20 6 9 17 4 12" /></SVG>,
  Heart:  (p) => <SVG {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></SVG>,
  Share:  (p) => <SVG {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></SVG>,
  Print:  (p) => <SVG {...p}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></SVG>,
  Spark:  (p) => <SVG {...p}><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4" /></SVG>,
  X:      (p) => <SVG {...p}><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></SVG>,
  WA:     (p) => <SVG {...p}><path d="M21 12a9 9 0 1 1-3.5-7.1L21 3l-1.4 4A9 9 0 0 1 21 12z" /><path d="M9 9c0 4 3 7 7 7l1.5-2-2.5-1-1 1c-1 0-3-2-3-3l1-1-1-2.5L9 9z" /></SVG>,
  Phone:  (p) => <SVG {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></SVG>,
  Mail:   (p) => <SVG {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></SVG>,
  Pin:    (p) => <SVG {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></SVG>,
};

/* ------ Lightbox -------------------------------------------------- */
function Lightbox({ open, idx, setIdx, onClose, images }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")  setIdx((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, images.length]);

  const cur = images[idx] || images[0];
  return (
    <div className={`lb ${open ? "on" : ""}`} onClick={onClose}>
      <div className="lb-top" onClick={(e) => e.stopPropagation()}>
        <div className="lb-info">
          <h4>{cur.room}</h4>
          <span>{String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}  ·  {cur.caption}</span>
        </div>
        <button className="lb-close" onClick={onClose} aria-label="Fechar"><I.X /></button>
      </div>
      <button className="lb-arrow prev" onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }} aria-label="anterior">
        <SVG size={22}><polyline points="15 18 9 12 15 6" /></SVG>
      </button>
      <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
        <div key={idx} className="lb-img" style={{ backgroundImage: `url(${cur.src})` }} />
      </div>
      <button className="lb-arrow next" onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }} aria-label="próximo">
        <SVG size={22}><polyline points="9 18 15 12 9 6" /></SVG>
      </button>
      <div className="lb-rail" onClick={(e) => e.stopPropagation()}>
        {images.map((img, i) => (
          <div key={i} className={`lb-rail-thumb ${i === idx ? "on" : ""}`}
               style={{ backgroundImage: `url(${img.src})` }}
               onClick={() => setIdx(i)} />
        ))}
      </div>
    </div>
  );
}

/* ------ Gallery hero --------------------------------------------- */
function GalleryHero({ prop, onOpen }) {
  const [tab, setTab] = React.useState("fotos");
  const [fav, setFav] = React.useState(false);
  return (
    <div className="gal" data-tab={tab}>
      {tab === "fotos" && (
        <>
          <div className="gal-main" onClick={() => onOpen(0)}>
            <div className="img" style={{ backgroundImage: `url(${prop.images[0].src})` }} />
          </div>
          <div className="gal-side">
            {prop.images.slice(1, 5).map((img, i) => (
              <div key={i} className="gal-thumb" onClick={() => onOpen(i + 1)}>
                <div className="img" style={{ backgroundImage: `url(${img.src})` }} />
              </div>
            ))}
          </div>
          <button className="gal-all" onClick={() => onOpen(0)}>
            <SVG size={14}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></SVG>
            Ver galeria · {prop.images.length} fotos
          </button>
        </>
      )}

      {tab === "tour" && <Tour360Placeholder prop={prop} />}
      {tab === "planta" && <PlantaPlaceholder prop={prop} />}

      <div className="gal-tabs">
        <button className={tab === "fotos" ? "on" : ""} onClick={() => setTab("fotos")}>Fotos</button>
        <button className={tab === "tour" ? "on" : ""} onClick={() => setTab("tour")}>Tour 360°</button>
        <button className={tab === "planta" ? "on" : ""} onClick={() => setTab("planta")}>Planta</button>
      </div>
      <div className="gal-actions">
        <button className={`gal-action ${fav ? "on" : ""}`} onClick={() => setFav((f) => !f)} aria-label="Favoritar">
          <I.Heart size={16} />
        </button>
        <button className="gal-action" aria-label="Compartilhar"><I.Share size={16} /></button>
        <button className="gal-action" aria-label="Imprimir"><I.Print size={16} /></button>
      </div>
    </div>
  );
}

/* ------ Tour 360 placeholder ------------------------------------ */
function Tour360Placeholder({ prop }) {
  if (prop.tourUrl) {
    return (
      <iframe
        src={prop.tourUrl}
        width="100%" height="100%"
        style={{ border: 0, borderRadius: 4, position: "absolute", inset: 0 }}
        allowFullScreen
        allow="xr-spatial-tracking"
        title="Tour 360°"
      />
    );
  }
  return (
    <div className="ph ph-tour">
      <div className="ph-bg" style={{ backgroundImage: `url(${prop.images[1].src})` }} />
      <div className="ph-veil" />
      <div className="ph-stage">
        <div className="ph-ring">
          <svg viewBox="0 0 200 200" className="ph-ring-svg">
            <defs>
              <path id="ph-arc" d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
            </defs>
            <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="2 4" />
            <text fill="currentColor" fontSize="9" letterSpacing="6" textLength="490">
              <textPath href="#ph-arc">VIRTUAL  ·  TOUR 360°  ·  EM BREVE  ·  VIRTUAL  ·  TOUR 360°  ·  EM BREVE  ·</textPath>
            </text>
          </svg>
          <div className="ph-glyph">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="12" rx="10" ry="4" />
              <ellipse cx="12" cy="12" rx="4" ry="10" />
              <circle cx="12" cy="12" r="1.2" fill="currentColor" />
            </svg>
          </div>
          <div className="ph-360">360°</div>
        </div>
        <div className="ph-meta">
          <span className="ph-eyebrow">Tour virtual</span>
          <h3>Caminhe pelo imóvel sem sair de casa</h3>
          <p>Nosso tour 360° ainda está em produção para esta unidade. Agende um <em>tour ao vivo por vídeo</em> com a consultora — câmera no imóvel, você comandando o trajeto.</p>
          <div className="ph-actions">
            <a className="ph-btn primary" href="#">Agendar tour ao vivo</a>
            <a className="ph-btn ghost" href="https://wa.me/5521997220589" target="_blank" rel="noopener">Receber 360° quando pronto</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------ Planta placeholder -------------------------------------- */
function PlantaPlaceholder({ prop }) {
  return (
    <div className="ph ph-planta">
      <div className="ph-grid" />
      <div className="ph-floor">
        <svg viewBox="0 0 600 360" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          {/* outer envelope */}
          <rect x="60" y="60" width="480" height="240" />
          {/* internal walls */}
          <line x1="320" y1="60" x2="320" y2="180" />
          <line x1="320" y1="180" x2="440" y2="180" />
          <line x1="440" y1="180" x2="440" y2="300" />
          <line x1="200" y1="180" x2="320" y2="180" />
          <line x1="200" y1="180" x2="200" y2="300" />
          <line x1="60" y1="260" x2="200" y2="260" />
          {/* balcony dashed */}
          <line x1="60" y1="300" x2="260" y2="300" strokeDasharray="4 5" />
          <rect x="60" y="300" width="200" height="34" strokeDasharray="4 5" />
          {/* furniture suggestions, ultra-light */}
          <rect x="80" y="80" width="100" height="50" strokeOpacity="0.35" />
          <circle cx="130" cy="200" r="22" strokeOpacity="0.35" />
          <rect x="220" y="80" width="80" height="38" strokeOpacity="0.35" />
          <rect x="340" y="80" width="80" height="80" strokeOpacity="0.35" />
          <rect x="220" y="200" width="80" height="40" strokeOpacity="0.35" />
          {/* door arcs */}
          <path d="M 260 180 A 20 20 0 0 1 280 200" strokeOpacity="0.4" />
          <path d="M 380 180 A 20 20 0 0 1 400 200" strokeOpacity="0.4" />
        </svg>
        <span className="ph-floor-tag tl">N</span>
        <span className="ph-floor-tag br">{prop.specs.areaUtil} m²</span>
      </div>
      <div className="ph-planta-meta">
        <span className="ph-eyebrow">Planta baixa</span>
        <h3>Planta detalhada sob solicitação</h3>
        <p>Enviamos a planta completa e legendada, com cotas e orientação solar, para todos os interessados. Solicite pelo WhatsApp ou agende uma visita.</p>
        <div className="ph-actions">
          <a className="ph-btn primary" href="https://wa.me/5521997220589?text=Gostaria%20da%20planta%20do%20im%C3%B3vel%20AP9830-NHB" target="_blank" rel="noopener">Solicitar planta (PDF)</a>
          <a className="ph-btn ghost" href="#contato">Falar com o consultor</a>
        </div>
      </div>
    </div>
  );
}



/* ------ Identity strip + specs ----------------------------------- */
function Identity({ prop }) {
  const [fav, setFav] = React.useState(false);
  return (
    <>
      <div className="idn">
        <div>
          <div className="idn-tags">
            <span className="idn-tag accent">{prop.status}</span>
            <span className="idn-tag">{prop.type}</span>
            <span className="idn-tag">Cód. {prop.code}</span>
            <span className="idn-tag">Pronto para morar</span>
          </div>
          <h1>{prop.title.split(", com")[0]}<em>{prop.title.includes(", com") ? ", com" + prop.title.split(", com")[1] : ""}</em></h1>
          <div className="idn-loc">
            <I.Pin size={16} style={{ color: "var(--accent)" }} />
            {prop.address}
          </div>
        </div>
        <div className="idn-price-block">
          <span className="idn-price-label">Valor de venda</span>
          <span className="idn-price">{BRL(prop.price)}</span>
          <div className="idn-price-meta">
            <span>Cond. <b>{BRL(prop.condominio)}</b></span>
            <span>IPTU <b>{BRL(prop.iptu)}/mês</b></span>
            <span>m² <b>{BRL(prop.m2Value)}</b></span>
          </div>
          <div className="idn-actions">
            <button className={`fav ${fav ? "on" : ""}`} onClick={() => setFav((f) => !f)}>
              <I.Heart size={14} /> {fav ? "Salvo" : "Salvar"}
            </button>
            <button><I.Share size={14} /> Compartilhar</button>
          </div>
        </div>
      </div>

      <div className="specs">
        <div className="spec"><I.Area className="spec-icon" /><span className="spec-num">{prop.specs.areaUtil}<small>m² úteis</small></span><span className="spec-lbl">Área útil</span></div>
        <div className="spec"><I.Area className="spec-icon" /><span className="spec-num">{prop.specs.areaBruta}<small>m² brutos</small></span><span className="spec-lbl">Área bruta</span></div>
        <div className="spec"><I.Bed className="spec-icon" /><span className="spec-num">{prop.specs.quartos}</span><span className="spec-lbl">Quartos</span></div>
        <div className="spec"><I.Suite className="spec-icon" /><span className="spec-num">{prop.specs.suites}</span><span className="spec-lbl">Suíte</span></div>
        <div className="spec"><I.Bath className="spec-icon" /><span className="spec-num">{prop.specs.banheiros}</span><span className="spec-lbl">Banheiros</span></div>
        <div className="spec"><I.Car className="spec-icon" /><span className="spec-num">{prop.specs.vagas}</span><span className="spec-lbl">Vaga · Aceita pet</span></div>
      </div>
    </>
  );
}

/* ------ Description with AI summary ----------------------------- */
function Description({ prop }) {
  const [tab, setTab] = React.useState("texto");
  const [ai, setAi] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (tab !== "ai" || ai || loading) return;
    setLoading(true);
    const prompt =
      "Em português brasileiro, escreva um resumo editorial de 3 frases curtas, no tom de um corretor de imóveis de luxo, " +
      "para este apartamento à venda no Rio de Janeiro:\n\n" +
      `Título: ${prop.title}\nEndereço: ${prop.address}\nPreço: ${BRL(prop.price)}\n` +
      `Área útil: ${prop.specs.areaUtil} m² · Quartos: ${prop.specs.quartos} · Suíte: ${prop.specs.suites} · Vaga: ${prop.specs.vagas}\n` +
      `Descrição original: ${prop.description.join(" ")}\n` +
      `Destaque: vista frontal para a Lagoa Rodrigo de Freitas, prédio com lazer completo. Seja conciso e elegante. Não use emoji.`;
    window.claude.complete(prompt)
      .then((r) => setAi((r || "").trim()))
      .catch(() => setAi("Não foi possível gerar o resumo agora. Tente novamente em instantes."))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="blk">
      <div className="blk-head">
        <h2>Sobre o <em>imóvel</em></h2>
        <div className="desc-tab">
          <button className={tab === "texto" ? "on" : ""} onClick={() => setTab("texto")}>Descrição</button>
          <button className={tab === "ai" ? "on" : ""} onClick={() => setTab("ai")}>
            <I.Spark size={11} /> Resumo IA
          </button>
        </div>
      </div>
      {tab === "texto" ? (
        <div className="desc">
          {prop.description.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      ) : (
        <div className="desc-ai">
          <div className="ai-head"><I.Spark size={12} /> Resumo gerado por IA · Beatriz, consultora</div>
          <div className="ai-body">
            {loading ? <span className="ai-loading"><span/><span/><span/></span> : ai}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------ Highlights ----------------------------------------------- */
function Highlights({ prop }) {
  const iconMap = { view: I.View, sun: I.Sun, key: I.Key };
  return (
    <div className="blk">
      <div className="blk-head">
        <h2>Por que <em>aqui</em>?</h2>
        <span className="blk-aside">Curadoria New Home</span>
      </div>
      <div className="high">
        {prop.highlights.map((h, i) => {
          const Ic = iconMap[h.icon];
          return (
            <div key={i} className="high-card">
              <Ic className="high-icon" size={22} />
              <h4>{h.title}</h4>
              <p>{h.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------ Features ------------------------------------------------- */
function Features({ prop }) {
  return (
    <div className="blk">
      <div className="blk-head">
        <h2>Características</h2>
        <span className="blk-aside">{Object.values(prop.features).flat().length} itens</span>
      </div>
      <div className="car-groups">
        {Object.entries(prop.features).map(([cat, items]) => (
          <div key={cat} className="car-group">
            <h3>{cat}</h3>
            <div className="car-list">
              {items.map((it, i) => (
                <div key={it} className="car-item" style={{ animationDelay: `${i * 0.04}s` }}>
                  <span className="chk"><I.Check size={10} /></span>
                  {it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------ Planta --------------------------------------------------- */
function Planta() {
  const [active, setActive] = React.useState(1);
  const rooms = [
    { id: 1, name: "Sala / Living", x: "30%", y: "40%" },
    { id: 2, name: "Varanda", x: "20%", y: "70%" },
    { id: 3, name: "Cozinha", x: "60%", y: "30%" },
    { id: 4, name: "Suíte", x: "75%", y: "55%" },
    { id: 5, name: "Quarto", x: "55%", y: "70%" },
  ];
  return (
    <div className="blk">
      <div className="blk-head">
        <h2>Planta do <em>apartamento</em></h2>
        <span className="blk-aside">Ambientes</span>
      </div>
      <div className="planta">
        <svg className="planta-svg" viewBox="0 0 400 220" fill="none" stroke="currentColor" strokeWidth="1.2">
          {/* outer walls */}
          <rect x="40" y="40" width="320" height="140" />
          {/* internal walls */}
          <line x1="200" y1="40" x2="200" y2="120" />
          <line x1="200" y1="120" x2="280" y2="120" />
          <line x1="280" y1="120" x2="280" y2="180" />
          <line x1="120" y1="120" x2="200" y2="120" />
          <line x1="120" y1="120" x2="120" y2="180" />
          <line x1="40" y1="160" x2="120" y2="160" />
          {/* balcony */}
          <line x1="40" y1="180" x2="160" y2="180" strokeDasharray="3 3" />
          <rect x="40" y="180" width="120" height="22" strokeDasharray="3 3" />
          {/* doors (arc gaps) */}
          <line x1="160" y1="120" x2="180" y2="120" stroke="var(--bg-2)" strokeWidth="2.4" />
          <line x1="240" y1="120" x2="260" y2="120" stroke="var(--bg-2)" strokeWidth="2.4" />
          <line x1="120" y1="160" x2="120" y2="140" stroke="var(--bg-2)" strokeWidth="2.4" />
        </svg>
        {rooms.map((r) => (
          <div key={r.id} className="planta-hot" style={{ left: r.x, top: r.y }} onMouseEnter={() => setActive(r.id)}>
            {r.id}
          </div>
        ))}
        <div className="planta-legend">
          {rooms.map((r) => (
            <span key={r.id} style={{ opacity: r.id === active ? 1 : 0.5 }}>
              <i>{r.id}</i> {r.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------ Localização ---------------------------------------------- */
function Localizacao({ prop }) {
  const iconFor = (cat) => {
    if (cat.startsWith("Lazer") || cat === "Praia") return I.Sun;
    if (cat.startsWith("Educação")) return I.Key;
    if (cat.startsWith("Saúde")) return I.Heart;
    if (cat.startsWith("Compras")) return I.View;
    return I.Pin;
  };
  return (
    <div className="blk">
      <div className="blk-head">
        <h2>Onde <em>fica</em></h2>
        <span className="blk-aside">Av. Epitácio Pessoa</span>
      </div>
      <div className="loc">
        <div className="loc-map">
          <div className="loc-map-grid" />
          <div className="lagoon" />
          <div className="loc-pin-main">
            <div className="ripple" />
            <div className="glyph"><I.Pin size={16} /></div>
          </div>
          <div className="loc-pin" data-label="Lagoa" style={{ left: "32%", top: "55%" }} />
          <div className="loc-pin" data-label="Cristo"   style={{ left: "62%", top: "20%" }} />
          <div className="loc-pin" data-label="Leblon"   style={{ left: "22%", top: "78%" }} />
          <div className="loc-pin" data-label="Ipanema"  style={{ left: "38%", top: "82%" }} />
        </div>
        <div className="loc-list">
          <h4>O que está perto</h4>
          {prop.nearby.map((n) => {
            const Ic = iconFor(n.cat);
            return (
              <div key={n.name} className="loc-row">
                <Ic className="ic" size={18} />
                <div className="nm">{n.name}<small>{n.cat}</small></div>
                <div className="ds">{n.dist}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------ Custos --------------------------------------------------- */
function Custos({ prop }) {
  return (
    <div className="blk">
      <div className="blk-head">
        <h2>Custos do <em>imóvel</em></h2>
        <span className="blk-aside">Valores informados pelo anunciante</span>
      </div>
      <div className="custos">
        <div className="custos-table">
          <div className="custos-row"><span className="l">Valor do imóvel</span><span className="v">{BRL(prop.price)}</span></div>
          <div className="custos-row"><span className="l">Condomínio mensal</span><span className="v">{BRL(prop.condominio)}</span></div>
          <div className="custos-row"><span className="l">IPTU mensal</span><span className="v">{BRL(prop.iptu)}</span></div>
          <div className="custos-row"><span className="l">Valor do m²</span><span className="v">{BRL(prop.m2Value)}</span></div>
          <div className="custos-row total"><span className="l">Custo mensal estimado</span><span className="v">{BRL(prop.condominio + prop.iptu)}</span></div>
        </div>

        <a className="custos-cta" href="financiamento.html">
          <span className="custos-cta-eyebrow">
            <I.Spark size={12} /> Financiamento
          </span>
          <span className="custos-cta-title">Simule seu financiamento <em>com os bancos parceiros</em></span>
          <span className="custos-cta-banks">
            <span>Itaú</span>
            <span>Santander</span>
            <span>BB</span>
            <span>Bradesco</span>
            <span>Caixa</span>
          </span>
          <span className="custos-cta-go">
            Ver bancos e simular
            <SVG size={14}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></SVG>
          </span>
        </a>
      </div>
    </div>
  );
}

/* ------ Sidebar -------------------------------------------------- */
function Sidebar({ prop }) {
  return (
    <aside className="side">
      <div className="agent-card">
        <div className="agent-top">
          <div className="agent-photo">
            <img src={prop.agent.photo} alt={prop.agent.name} />
          </div>
          <div>
            <div className="agent-name">{prop.agent.name}</div>
            <div className="agent-meta">Consultor · CRECI-RJ {prop.agent.creci}</div>
          </div>
        </div>
        <div className="agent-rating">
          <span className="agent-stars">★★★★★</span>
          <span><b>{prop.agent.rating}</b> · {prop.agent.reviews} avaliações</span>
        </div>
        <div className="agent-actions">
          <a className="agent-btn primary" href={waLink(prop)} target="_blank" rel="noopener">
            <I.WA size={16} /> Conversar no WhatsApp
          </a>
          <a className="agent-btn ghost" href={`tel:${prop.agent.phone}`}>
            <I.Phone size={14} /> {prop.agent.phoneDisplay}
          </a>
          <a className="agent-btn ghost" href="#contato">
            <I.Mail size={14} /> Enviar e-mail
          </a>
        </div>
      </div>

      <VisitScheduler prop={prop} />
    </aside>
  );
}

function VisitScheduler({ prop }) {
  const [day, setDay] = React.useState(2);
  const [time, setTime] = React.useState("14:00");
  const [mode, setMode] = React.useState("presencial");

  const days = React.useMemo(() => {
    const out = [];
    const today = new Date();
    const dn = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
    const mn = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    for (let k = 0; k < 4; k++) {
      const d = new Date(today); d.setDate(today.getDate() + k + 1);
      out.push({ dn: dn[d.getDay()], dd: d.getDate(), dm: mn[d.getMonth()] });
    }
    return out;
  }, []);
  const times = ["10:00", "12:00", "14:00", "16:00", "18:00", "19:30"];

  const submit = (e) => {
    e.preventDefault();
    alert(`Visita ${mode} solicitada para ${days[day].dn} ${days[day].dd}/${days[day].dm} às ${time}. Beatriz confirmará por WhatsApp.`);
  };

  return (
    <form className="visit" onSubmit={submit}>
      <h4>Agendar visita</h4>
      <div className="visit-sub">Confirmação em até 1h por WhatsApp.</div>
      <div className="visit-days">
        {days.map((d, i) => (
          <div key={i} className={`visit-day ${i === day ? "on" : ""}`} onClick={() => setDay(i)}>
            <div className="dn">{d.dn}</div>
            <div className="dd">{d.dd}</div>
            <div className="dm">{d.dm}</div>
          </div>
        ))}
      </div>
      <div className="visit-times">
        {times.map((t) => (
          <div key={t} className={`visit-time ${t === time ? "on" : ""}`} onClick={() => setTime(t)}>{t}</div>
        ))}
      </div>
      <div className="visit-mode">
        <button type="button" className={mode === "presencial" ? "on" : ""} onClick={() => setMode("presencial")}>Presencial</button>
        <button type="button" className={mode === "video" ? "on" : ""} onClick={() => setMode("video")}>Vídeo</button>
      </div>
      <button type="submit" className="visit-cta">Solicitar visita</button>
    </form>
  );
}

/* ------ Similar -------------------------------------------------- */
function Similar({ prop }) {
  return (
    <section className="similar">
      <div className="sec-head" style={{ paddingTop: 0 }}>
        <h2>Imóveis <em>semelhantes</em></h2>
        <p>Selecionados a partir do bairro, perfil e faixa de valor.</p>
      </div>
      <div className="similar-rail">
        {prop.similar.map((s) => (
          <div key={s.code} className="sim-card">
            <div className="sim-img" style={{ backgroundImage: `url(${s.img})` }}>
              {s.tag && <span className="sim-tag">{s.tag}</span>}
            </div>
            <div className="sim-body">
              <span className="sim-type">{s.type} · {s.region}</span>
              <span className="sim-title">{s.title}</span>
              <div className="sim-specs">
                <span>{s.area} m²</span>
                <span>·</span>
                <span>{s.rooms} quartos</span>
                <span>·</span>
                <span>{s.parking} vaga{s.parking > 1 ? "s" : ""}</span>
              </div>
              <span className="sim-price">{BRL(s.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, {
  PROP, GalleryHero, Lightbox, Identity, Description, Highlights,
  Features, Planta, Localizacao, Custos, Sidebar, Similar
});
