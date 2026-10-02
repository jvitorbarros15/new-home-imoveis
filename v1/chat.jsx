// New Home Imóveis — floating guided chat (buttons only, no free text)

const CHAT_START_TEXT = "Olá! Sou o assistente automático da New Home. Como posso ajudar?";

const CHAT_STEPS = {
  start: { text: CHAT_START_TEXT, options: () => [
    { label: "Quero comprar", set: { purpose: "sale" }, next: "region" },
    { label: "Quero alugar", set: { purpose: "rent" }, next: "region" },
    { label: "Quero anunciar meu imóvel", href: NH.listPropertyUrl, track: "anunciar" },
    { label: "Falar com a equipe", next: "human" },
  ] },
  region: { text: "Em qual região?", options: () => REGIONS.map(r => ({ label: r, set: { region: r === "Outra" ? "" : r }, next: "price" })) },
  price: { text: "Qual faixa de valor?", options: (a) => PRICE_BANDS[a.purpose].map(b => ({ label: b.label, set: { band: b }, next: "rooms" })) },
  rooms: { text: "Quantos quartos, no mínimo?", options: () => [1, 2, 3, 4].map(n => ({ label: n === 4 ? "4 ou mais" : String(n), set: { rooms: n }, next: "result" })) },
};

function chatSearchUrl(a) {
  const params = new URLSearchParams({ purpose: a.purpose });
  if (a.region) params.set("q", a.region);
  if (a.band.min !== "") params.set("min", a.band.min);
  if (a.band.max !== "") params.set("max", a.band.max);
  params.set("quartos", a.rooms);
  return `${NH.listingsUrl}?${params}`;
}

function chatWhatsappMessage(a) {
  const place = a.region ? ` em ${a.region}` : "";
  return `Olá! Procuro imóvel para ${a.purpose === "rent" ? "alugar" : "comprar"}${place}, ${a.band.label}, com ${a.rooms} ${a.rooms === 1 ? "quarto" : "quartos"} ou mais.`;
}

async function chatCountListings(a) {
  if (!window.sb) return null;
  try {
    let query = window.sb.from("properties").select("code", { count: "exact", head: true })
      .eq("purpose", a.purpose).gte("bedrooms", a.rooms);
    if (a.band.min !== "") query = query.gte("price_brl", a.band.min * 100);
    if (a.band.max !== "") query = query.lte("price_brl", a.band.max * 100);
    const term = a.region.replace(/[%,()*]/g, " ").trim();
    if (term) query = query.or(`title.ilike.%${term}%,region.ilike.%${term}%`);
    const { count, error } = await query;
    return error ? null : count;
  } catch (e) {
    return null;
  }
}

function Chat() {
  const [open, setOpen] = React.useState(false);
  const [typing, setTyping] = React.useState(false);
  const [step, setStep] = React.useState("start");
  const [answers, setAnswers] = React.useState({});
  const [count, setCount] = React.useState(null);
  const [messages, setMessages] = React.useState([{ from: "agent", text: CHAT_START_TEXT }]);
  const lastFocus = React.useRef(null);
  const scrollRef = React.useRef(null);
  const optionsRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, open, step]);

  React.useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement;
    } else if (lastFocus.current) {
      lastFocus.current.focus?.();
      lastFocus.current = null;
    }
  }, [open]);

  React.useEffect(() => {
    if (!open || typing) return;
    const frame = requestAnimationFrame(() => optionsRef.current?.querySelector("button, a")?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, step, typing]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const options = (() => {
    if (step === "human") {
      return [
        { label: "Abrir WhatsApp", href: NH.whatsapp(), external: true, primary: true, track: "equipe" },
        { label: `Ligar ${NH.primaryPhoneDisplay}`, href: `tel:${NH.primaryPhone}`, track: "ligar" },
      ];
    }
    if (step === "result") {
      const list = { label: count > 0 ? `Ver ${count} ${count === 1 ? "imóvel" : "imóveis"}` : "Ver imóveis", href: chatSearchUrl(answers), track: "ver_imoveis" };
      const whatsapp = { label: "Continuar no WhatsApp", href: NH.whatsapp(chatWhatsappMessage(answers)), external: true, track: "resultado" };
      return count === 0 ? [{ ...whatsapp, primary: true }, list] : [{ ...list, primary: true }, whatsapp];
    }
    return CHAT_STEPS[step].options(answers);
  })();

  async function choose(option) {
    if (typing) return;
    const nextAnswers = { ...answers, ...option.set };
    setMessages((m) => [...m, { from: "user", text: option.label }]);
    setAnswers(nextAnswers);
    setTyping(true);

    let reply;
    let found = null;
    if (option.next === "result") {
      [found] = await Promise.all([chatCountListings(nextAnswers), new Promise((r) => setTimeout(r, 350))]);
      reply = found === 0
        ? "Não encontrei imóveis com esse perfil agora, mas a equipe pode procurar para você."
        : found > 0
          ? `Encontrei ${found} ${found === 1 ? "opção" : "opções"} para você.`
          : "Veja as opções disponíveis para o seu perfil.";
      track("chat_complete", { detail: `${nextAnswers.purpose}|${nextAnswers.region || "outra"}|${nextAnswers.band.label}|${nextAnswers.rooms}` });
    } else {
      await new Promise((r) => setTimeout(r, 350));
      reply = option.next === "human" ? "Fale direto com a equipe:" : CHAT_STEPS[option.next].text;
    }
    setCount(found);
    setStep(option.next);
    setTyping(false);
    setMessages((m) => [...m, { from: "agent", text: reply }]);
  }

  function restart() {
    setStep("start");
    setAnswers({});
    setCount(null);
    setTyping(false);
    setMessages([{ from: "agent", text: CHAT_START_TEXT }]);
  }

  return (
    <>
      <button
        className={`chat-fab ${open ? "open" : ""}`}
        aria-label={open ? "Fechar chat" : "Abrir chat"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="chat-fab-icon chat-fab-chat">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </span>
        <span className="chat-fab-icon chat-fab-close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </span>
      </button>

      {open && <div className="chat-panel show" role="dialog" aria-label="Assistente automático New Home">
        <header className="chat-head">
          <div className="chat-avatar" aria-hidden="true">
            <span>NH</span>
          </div>
          <div className="chat-who">
            <div className="chat-name">Assistente automático</div>
            <div className="chat-role">
              Respostas pré-programadas · fale com a equipe no WhatsApp
            </div>
          </div>
          <button className="chat-x" onClick={() => setOpen(false)} aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </header>

        <div className="chat-body" ref={scrollRef} role="log" aria-live="polite">
          <div className="chat-day">Hoje</div>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.from}`}>
              <div className="chat-bubble">{m.text}</div>
            </div>
          ))}
          {typing && (
            <div className="chat-msg agent">
              <div className="chat-bubble chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          {!typing && (
            <div className="chat-quick" role="group" aria-label="Opções de resposta" ref={optionsRef}>
              {options.map((o) => o.href ? (
                <a key={o.label} className={o.primary ? "primary" : ""} href={o.href}
                   {...(o.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                   onClick={() => track(o.external ? "whatsapp_click" : "chat_option", { detail: `chat_${o.track}` })}>{o.label}</a>
              ) : (
                <button key={o.label} type="button" onClick={() => choose(o)}>{o.label}</button>
              ))}
            </div>
          )}
        </div>

        <div className="chat-foot">
          {step !== "start" && <button type="button" className="chat-restart" onClick={restart}>Recomeçar</button>}
          <span className="chat-foot-label">Prefere outro canal?</span>
          <a href={NH.whatsapp()} target="_blank" rel="noopener noreferrer"
             onClick={() => track("whatsapp_click", { detail: "chat" })}>WhatsApp</a>
          <a href={`tel:${NH.primaryPhone}`}>Ligar</a>
        </div>
      </div>}
    </>
  );
}

window.Chat = Chat;
