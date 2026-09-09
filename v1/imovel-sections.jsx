// Property page sections

const PROP = {
  code: "AP9680-NHB",
  status: "À venda",
  type: "Apartamento",
  title: "Apartamento decorado no Saint Michael, Ilha Pura",
  address: "Ilha Pura · Barra da Tijuca · Rio de Janeiro / RJ",
  region: "Barra da Tijuca",
  price: 2290000,
  condominio: 2000,
  iptu: 500,
  m2Value: 17218,
  specs: { areaUtil: 133, areaBruta: 133, quartos: 3, suites: 2, banheiros: 3, vagas: 2, pet: true },
  description: [
    "Apartamento decorado no condomínio Saint Michael, no Ilha Pura, com vista para a lagoa e acabamento de alto padrão.",
    "A planta tem três quartos, incluindo duas suítes, sala em dois ambientes, varanda gourmet, lavabo e área de serviço. A suíte principal possui closet. O anúncio informa automação com Alexa, móveis da Casa Shopping e venda com porteira fechada.",
  ],
  highlights: [
    { icon: "view", title: "Vista para a lagoa", desc: "Uma das características informadas no anúncio da unidade." },
    { icon: "key", title: "Porteira fechada", desc: "O imóvel é anunciado decorado e mobiliado." },
    { icon: "sun", title: "Varanda gourmet", desc: "Área externa integrada ao apartamento." },
  ],
  features: {
    "Imóvel": ["Área de serviço", "Banheiro de serviço", "Quarto de serviço", "Lavabo", "Lavanderia", "Porcelanato", "Varanda", "Varanda gourmet"],
    "Condomínio": ["Campo de futebol", "Churrasqueira", "Piscina", "Quadra poliesportiva", "Sauna"],
  },
  nearby: [],
  images: [
    { src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=82&auto=format&fit=crop", caption: "Imagem ilustrativa — confirme as fotos oficiais", room: "Referência visual" },
    { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=82&auto=format&fit=crop", caption: "Imagem ilustrativa — confirme as fotos oficiais", room: "Referência visual" },
    { src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=82&auto=format&fit=crop", caption: "Imagem ilustrativa — confirme as fotos oficiais", room: "Referência visual" },
    { src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=82&auto=format&fit=crop", caption: "Imagem ilustrativa — confirme as fotos oficiais", room: "Referência visual" },
    { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=82&auto=format&fit=crop", caption: "Imagem ilustrativa — confirme as fotos oficiais", room: "Referência visual" },
  ],
  imagesAreIllustrative: true,
  tourUrl: null,
  officialUrl: "https://www.imoveisnewhome.com.br/imoveis?codigo=AP9680-NHB",
  agent: { name: "Erick Leonardo", creci: "51.507", phone: NH.primaryPhone, phoneDisplay: NH.primaryPhoneDisplay },
  similar: [
    { code: "AP0694-NHB", type: "Apartamento", title: "Apartamento de 92 m² com três quartos", region: "Barra Olímpica", area: 92, rooms: 3, parking: 1, price: 1100000 },
    { code: "AP9886-NHB", type: "Apartamento", title: "Apartamento de 110 m² com três quartos", region: "Barra da Tijuca", area: 110, rooms: 3, parking: 2, price: 1200000 },
    { code: "AP9879-NHB", type: "Apartamento", title: "Apartamento de 136 m² com quatro quartos", region: "Barra Olímpica", area: 136, rooms: 4, parking: 2, price: 1470000 },
  ],
};

const BRL = (value) => typeof value === "number" ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) : "Consulte";
const propertyWhatsapp = (prop, extra = "Gostaria de mais informações.") =>
  NH.whatsapp(`Olá! Tenho interesse no imóvel ${prop.code} — ${prop.title}. ${extra}`);

const I = {
  Area: (p) => <SVG {...p}><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></SVG>,
  Bed: (p) => <SVG {...p}><path d="M2 4v16M22 8H8a4 4 0 0 0-4 4v8M2 20h20M22 20V8"/></SVG>,
  Bath: (p) => <SVG {...p}><path d="M9 6V3a1 1 0 0 1 1-1h2M5 12V6h14v6M3 12h18l-1 6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/></SVG>,
  Car: (p) => <SVG {...p}><path d="M5 17h14M7 17v3M17 17v3M3 11l2-5h14l2 5M3 11h18v6H3z"/><circle cx="7.5" cy="14" r="1"/><circle cx="16.5" cy="14" r="1"/></SVG>,
  Suite: (p) => <SVG {...p}><path d="M3 6v14M21 6v14M3 11h18M5 6h14v5H5z"/></SVG>,
  View: (p) => <SVG {...p}><circle cx="12" cy="12" r="3"/><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"/></SVG>,
  Sun: (p) => <SVG {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3"/></SVG>,
  Key: (p) => <SVG {...p}><circle cx="7" cy="14" r="4"/><path d="M11 14h11l-3 3M16 17v3"/></SVG>,
  Check: (p) => <SVG {...p} size={p.size || 10}><polyline points="20 6 9 17 4 12"/></SVG>,
  Heart: (p) => <SVG {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></SVG>,
  Share: (p) => <SVG {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></SVG>,
  Print: (p) => <SVG {...p}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></SVG>,
  WA: (p) => <SVG {...p}><path d="M21 12a9 9 0 1 1-3.5-7.1L21 3l-1.4 4A9 9 0 0 1 21 12z"/><path d="M9 9c0 4 3 7 7 7l1.5-2-2.5-1-1 1c-1 0-3-2-3-3l1-1-1-2.5L9 9z"/></SVG>,
  Phone: (p) => <SVG {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></SVG>,
  Mail: (p) => <SVG {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></SVG>,
  Pin: (p) => <SVG {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></SVG>,
  X: (p) => <SVG {...p}><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></SVG>,
};

function readFavorite(code) {
  try { return localStorage.getItem(`favorite:${code}`) === "1"; } catch (e) { return false; }
}

function Lightbox({ open, idx, setIdx, onClose, images }) {
  const closeRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setIdx((value) => (value + 1) % images.length);
      if (event.key === "ArrowLeft") setIdx((value) => (value - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [open, images.length, onClose, setIdx]);
  if (!open || !images.length) return null;
  const current = images[idx] || images[0];
  return <div className="lb on" role="dialog" aria-modal="true" aria-label="Galeria de imagens" onClick={onClose}>
    <div className="lb-top" onClick={(e) => e.stopPropagation()}><div className="lb-info"><h4>{current.room}</h4><span>{idx + 1} / {images.length} · {current.caption}</span></div><button ref={closeRef} type="button" className="lb-close" onClick={onClose} aria-label="Fechar galeria"><I.X/></button></div>
    <button type="button" className="lb-arrow prev" onClick={(e) => { e.stopPropagation(); setIdx((value) => (value - 1 + images.length) % images.length); }} aria-label="Imagem anterior">‹</button>
    <div className="lb-stage" onClick={(e) => e.stopPropagation()}><img key={current.src} src={current.src} alt={current.caption} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}}/></div>
    <button type="button" className="lb-arrow next" onClick={(e) => { e.stopPropagation(); setIdx((value) => (value + 1) % images.length); }} aria-label="Próxima imagem">›</button>
  </div>;
}

function GalleryHero({ prop, onOpen }) {
  const [favorite, setFavorite] = React.useState(() => readFavorite(prop.code));
  React.useEffect(() => setFavorite(readFavorite(prop.code)), [prop.code]);
  const toggleFavorite = () => {
    const next = !favorite;
    setFavorite(next);
    try {
      if (next) localStorage.setItem(`favorite:${prop.code}`, "1");
      else localStorage.removeItem(`favorite:${prop.code}`);
    } catch (e) {
      // Private browsing blocks storage; the toggle stays session-only.
    }
    track(next ? "favorite_add" : "favorite_remove", { code: prop.code });
  };
  const share = async () => {
    const data = { title: prop.title, text: `Imóvel ${prop.code} — ${prop.title}`, url: location.href };
    if (navigator.share) await navigator.share(data).catch(() => {});
    else await navigator.clipboard?.writeText(location.href);
  };
  return <div className="gal">
    <button type="button" className="gal-main" onClick={() => onOpen(0)} aria-label="Abrir imagem principal"><div className="img" style={{backgroundImage:`url(${prop.images[0]?.src})`}}/></button>
    <div className="gal-side">{prop.images.slice(1,5).map((image,index) => <button type="button" key={image.src} className="gal-thumb" onClick={() => onOpen(index + 1)} aria-label={`Abrir imagem ${index + 2}`}><div className="img" style={{backgroundImage:`url(${image.src})`}}/></button>)}</div>
    <button type="button" className="gal-all" onClick={() => onOpen(0)}>Ver galeria · {prop.images.length} imagens</button>
    <div className="gal-actions">
      <button type="button" className={`gal-action ${favorite ? "on" : ""}`} onClick={toggleFavorite} aria-pressed={favorite} aria-label={favorite ? "Remover dos favoritos" : "Salvar nos favoritos"}><I.Heart size={16}/></button>
      <button type="button" className="gal-action" onClick={share} aria-label="Compartilhar"><I.Share size={16}/></button>
      <button type="button" className="gal-action" onClick={() => window.print()} aria-label="Imprimir"><I.Print size={16}/></button>
    </div>
    {prop.imagesAreIllustrative && <div className="gal-tabs" role="note"><span>Imagens ilustrativas · veja as fotos reais no anúncio oficial</span></div>}
  </div>;
}

function Identity({ prop }) {
  return <><div className="idn">
    <div><div className="idn-tags"><span className="idn-tag accent">{prop.status}</span><span className="idn-tag">{prop.type}</span><span className="idn-tag">Cód. {prop.code}</span></div>
      <h1>{prop.title}</h1><div className="idn-loc"><I.Pin size={16}/>{prop.address}</div>
      {prop.officialUrl && <a className="agent-btn ghost" href={prop.officialUrl} target="_blank" rel="noopener noreferrer" style={{marginTop:14}}>Ver anúncio e fotos oficiais ↗</a>}
    </div>
    <div className="idn-price-block"><span className="idn-price-label">Valor anunciado</span><span className="idn-price">{BRL(prop.price)}</span>
      <div className="idn-price-meta"><span>Cond. <b>{BRL(prop.condominio)}</b></span><span>IPTU <b>{BRL(prop.iptu)}/mês</b></span><span>m² <b>{BRL(prop.m2Value)}</b></span></div>
    </div>
  </div>
  <div className="specs">
    <div className="spec"><I.Area className="spec-icon"/><span className="spec-num">{prop.specs.areaUtil}<small>m²</small></span><span className="spec-lbl">Área útil</span></div>
    <div className="spec"><I.Bed className="spec-icon"/><span className="spec-num">{prop.specs.quartos}</span><span className="spec-lbl">Quartos</span></div>
    <div className="spec"><I.Suite className="spec-icon"/><span className="spec-num">{prop.specs.suites}</span><span className="spec-lbl">Suítes</span></div>
    <div className="spec"><I.Bath className="spec-icon"/><span className="spec-num">{prop.specs.banheiros}</span><span className="spec-lbl">Banheiros</span></div>
    <div className="spec"><I.Car className="spec-icon"/><span className="spec-num">{prop.specs.vagas}</span><span className="spec-lbl">Vagas</span></div>
    <div className="spec"><span className="spec-num">{prop.specs.pet ? "Sim" : "Consulte"}</span><span className="spec-lbl">Aceita pet</span></div>
  </div></>;
}

function Description({ prop }) {
  const summary = `${prop.type} de ${prop.specs.areaUtil} m² em ${prop.region}, com ${prop.specs.quartos} quartos, ${prop.specs.suites} suítes e ${prop.specs.vagas} vagas. ${prop.highlights.map((item) => item.title).join(", ")}.`;
  const [showSummary, setShowSummary] = React.useState(false);
  return <div className="blk"><div className="blk-head"><h2>Sobre o <em>imóvel</em></h2><div className="desc-tab">
    <button type="button" className={!showSummary ? "on" : ""} onClick={() => setShowSummary(false)}>Descrição</button>
    <button type="button" className={showSummary ? "on" : ""} onClick={() => setShowSummary(true)}>Resumo</button>
  </div></div>
  {showSummary ? <div className="desc-ai"><div className="ai-head">Resumo dos dados do anúncio</div><div className="ai-body">{summary}</div></div>
    : <div className="desc">{prop.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}</div>;
}

function Highlights({ prop }) {
  if (!prop.highlights?.length) return null;
  const iconMap = {view:I.View,sun:I.Sun,key:I.Key};
  return <div className="blk"><div className="blk-head"><h2>Destaques do <em>anúncio</em></h2><span className="blk-aside">Confirme a disponibilidade</span></div>
    <div className="high">{prop.highlights.map((item) => { const Icon=iconMap[item.icon] || I.Check; return <div key={item.title} className="high-card"><Icon className="high-icon" size={22}/><h4>{item.title}</h4><p>{item.desc}</p></div>; })}</div>
  </div>;
}

function Features({ prop }) {
  if (!prop.features || !Object.keys(prop.features).length) return null;
  return <div className="blk"><div className="blk-head"><h2>Características</h2><span className="blk-aside">Informadas no anúncio</span></div>
    <div className="car-groups">{Object.entries(prop.features).map(([category,items]) => <div key={category} className="car-group"><h3>{category}</h3><div className="car-list">{items.map((item) => <div key={item} className="car-item"><span className="chk"><I.Check size={10}/></span>{item}</div>)}</div></div>)}</div>
  </div>;
}

function Localizacao({ prop }) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.region + ", Rio de Janeiro")}`;
  return <div className="blk"><div className="blk-head"><h2>Onde <em>fica</em></h2><span className="blk-aside">{prop.region}</span></div>
    <div className="loc"><a className="loc-map" href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label={`Abrir mapa de ${prop.region}`}><div className="loc-map-grid"/><div className="loc-pin-main"><div className="ripple"/><div className="glyph"><I.Pin size={16}/></div></div></a>
      <div className="loc-list"><h4>Localização aproximada</h4><p>Por segurança e privacidade, o endereço exato deve ser confirmado com a equipe New Home.</p><a className="agent-btn ghost" href={mapUrl} target="_blank" rel="noopener noreferrer">Abrir região no mapa ↗</a></div>
    </div>
  </div>;
}

function Custos({ prop }) {
  return <div className="blk"><div className="blk-head"><h2>Custos do <em>imóvel</em></h2><span className="blk-aside">Valores sujeitos a alteração</span></div>
    <div className="custos"><div className="custos-table">
      <div className="custos-row"><span className="l">Valor anunciado</span><span className="v">{BRL(prop.price)}</span></div>
      <div className="custos-row"><span className="l">Condomínio mensal</span><span className="v">{BRL(prop.condominio)}</span></div>
      <div className="custos-row"><span className="l">IPTU mensal informado</span><span className="v">{BRL(prop.iptu)}</span></div>
      <div className="custos-row"><span className="l">Valor aproximado do m²</span><span className="v">{BRL(prop.m2Value)}</span></div>
    </div>
    <a className="custos-cta" href="financiamento.html"><span className="custos-cta-eyebrow">Planejamento</span><span className="custos-cta-title">Faça uma estimativa de financiamento</span><span className="custos-cta-go">Abrir simulador →</span></a></div>
    <p className="sim-fine">Preço, condomínio, IPTU, disponibilidade e condições podem mudar sem aviso. Confirme as informações antes da visita ou proposta.</p>
  </div>;
}

function Sidebar({ prop }) {
  return <aside className="side"><div className="agent-card">
    <div className="agent-top"><div><div className="agent-name">{prop.agent.name}</div><div className="agent-meta">Corretor · CRECI-RJ {prop.agent.creci}</div></div></div>
    <div className="agent-actions">
      <a className="agent-btn primary" href={propertyWhatsapp(prop)} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { code: prop.code, detail: "sidebar" })}><I.WA size={16}/>Conversar no WhatsApp</a>
      <a className="agent-btn ghost" href={`tel:${prop.agent.phone}`}><I.Phone size={14}/>{prop.agent.phoneDisplay}</a>
      <a className="agent-btn ghost" href={`mailto:${NH.email}?subject=${encodeURIComponent("Imóvel " + prop.code)}`}><I.Mail size={14}/>Enviar e-mail</a>
    </div>
  </div><VisitScheduler prop={prop}/></aside>;
}

function VisitScheduler({ prop }) {
  const [day, setDay] = React.useState(0);
  const [time, setTime] = React.useState("14:00");
  const [mode, setMode] = React.useState("presencial");
  const days = React.useMemo(() => Array.from({length:4}, (_,index) => {
    const date = new Date(); date.setDate(date.getDate() + index + 1);
    return { iso: date.toISOString().slice(0,10), label: date.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short"}) };
  }), []);
  const times=["10:00","12:00","14:00","16:00","18:00"];
  const submit = (event) => {
    event.preventDefault();
    const message = `Gostaria de solicitar uma visita ${mode} ao imóvel ${prop.code} em ${days[day].label}, às ${time}. Aguardo confirmação de disponibilidade.`;
    window.open(propertyWhatsapp(prop, message), "_blank", "noopener,noreferrer");
  };
  return <form className="visit" onSubmit={submit}><h4>Solicitar visita</h4><div className="visit-sub">A data depende de confirmação da equipe e do responsável pelo imóvel.</div>
    <div className="visit-days">{days.map((item,index) => <button type="button" key={item.iso} className={`visit-day ${index===day?"on":""}`} aria-pressed={index===day} onClick={() => setDay(index)}><span className="dn">{item.label}</span></button>)}</div>
    <div className="visit-times">{times.map((item) => <button type="button" key={item} className={`visit-time ${item===time?"on":""}`} aria-pressed={item===time} onClick={() => setTime(item)}>{item}</button>)}</div>
    <div className="visit-mode"><button type="button" className={mode==="presencial"?"on":""} aria-pressed={mode==="presencial"} onClick={() => setMode("presencial")}>Presencial</button><button type="button" className={mode==="video"?"on":""} aria-pressed={mode==="video"} onClick={() => setMode("video")}>Vídeo</button></div>
    <button type="submit" className="visit-cta">Solicitar pelo WhatsApp</button>
  </form>;
}

function Similar({ prop }) {
  if (!prop.similar?.length) return null;
  return <section className="similar"><div className="sec-head" style={{paddingTop:0}}><h2>Outras <em>opções</em></h2><p>Consulte disponibilidade, endereço e valores atualizados no portal oficial.</p></div>
    <div className="similar-rail">{prop.similar.map((item) => <a key={item.code} className="sim-card" href={`imovel.html?code=${encodeURIComponent(item.code)}`} onClick={() => track("listing_click", { code: item.code, detail: "similares" })}>
      <div className="sim-body"><span className="sim-type">{item.type} · {item.region}</span><span className="sim-title">{item.title}</span>
        <div className="sim-specs"><span>{item.area} m²</span><span>·</span><span>{item.rooms} quartos</span><span>·</span><span>{item.parking} vaga{item.parking===1?"":"s"}</span></div><span className="sim-price">{BRL(item.price)}</span>
      </div></a>)}</div>
  </section>;
}

Object.assign(window, { PROP, GalleryHero, Lightbox, Identity, Description, Highlights, Features, Localizacao, Custos, Sidebar, Similar });
