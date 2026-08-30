// New Home Imóveis — floating chat with consultor

function Chat({ brand }) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [unread, setUnread] = React.useState(1);
  const [messages, setMessages] = React.useState([
    {
      from: "agent",
      text: "Olá! Este é o atendimento da New Home. Posso te ajudar a comprar, alugar ou anunciar um imóvel?",
      time: "agora",
    },
  ]);
  const scrollRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, open]);

  React.useEffect(() => {
    if (open) {
      setUnread(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const QUICK = [
    "Quero comprar um imóvel",
    "Quero alugar",
    "Anunciar meu imóvel",
    "Falar com um humano",
  ];

  async function send(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    setInput("");
    const next = [...messages, { from: "user", text: trimmed, time: "agora" }];
    setMessages(next);
    setTyping(true);

    const normalized = trimmed.toLocaleLowerCase("pt-BR");
    let reply;
    if (normalized.includes("humano") || normalized.includes("corretor") || normalized.includes("whatsapp")) {
      reply = `Claro. Fale com a equipe pelo WhatsApp ${NH.primaryPhoneDisplay}; o botão está logo abaixo.`;
    } else if (normalized.includes("alugar")) {
      reply = "Temos opções para locação. Qual região e faixa de valor você procura?";
    } else if (normalized.includes("anunciar") || normalized.includes("vender meu")) {
      reply = "Podemos ajudar a anunciar seu imóvel. Em qual bairro ele fica?";
    } else if (normalized.includes("comprar")) {
      reply = "Ótimo. Qual região e faixa de valor você tem em mente?";
    } else if (normalized.includes("barra") || normalized.includes("recreio") || normalized.includes("olímpica")) {
      reply = "Essa é uma das regiões de atuação da New Home. Quantos quartos você precisa?";
    } else {
      reply = "Obrigado pelas informações. Para receber opções atuais, continue pelo WhatsApp com a equipe New Home.";
    }

    // small natural delay
    await new Promise((r) => setTimeout(r, 350));
    setTyping(false);
    setMessages((m) => [...m, { from: "agent", text: reply, time: "agora" }]);
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
        {unread > 0 && !open && <span className="chat-badge">{unread}</span>}
      </button>

      {open && <div className="chat-panel show" role="dialog" aria-modal="true" aria-label="Atendimento New Home">
        <header className="chat-head">
          <div className="chat-avatar">
            <span>BS</span>
            <span className="chat-status" />
          </div>
          <div className="chat-who">
            <div className="chat-name">Equipe New Home <span className="chat-creci">CRECI {NH.creci}</span></div>
            <div className="chat-role">
              <span className="chat-dot" /> Online agora · responde em poucos minutos
            </div>
          </div>
          <button className="chat-x" onClick={() => setOpen(false)} aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </header>

        <div className="chat-body" ref={scrollRef}>
          <div className="chat-day">Hoje</div>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.from}`}>
              <div className="chat-bubble">{m.text}</div>
              <div className="chat-time">{m.time}</div>
            </div>
          ))}
          {typing && (
            <div className="chat-msg agent">
              <div className="chat-bubble chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          {messages.length === 1 && !typing && (
            <div className="chat-quick">
              {QUICK.map((q) => (
                <button key={q} onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}
        </div>

        <form
          className="chat-input"
          onSubmit={(e) => { e.preventDefault(); send(input); }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva uma mensagem…"
            aria-label="Mensagem"
          />
          <button type="submit" aria-label="Enviar" disabled={!input.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>

        <div className="chat-foot">
          Prefere outro canal?
          <a href={NH.whatsapp()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          ·
          <a href={`tel:${NH.primaryPhone}`}>Ligar</a>
        </div>
      </div>}
    </>
  );
}

window.Chat = Chat;
