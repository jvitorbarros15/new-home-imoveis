// Seller lead form: owners who want to list a property.

const SELLER_PURPOSES = [{ v: "sale", l: "Vender" }, { v: "rent", l: "Alugar" }];

function SellerPage() {
  const [state, setState] = React.useState("");
  useReveal();

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const phone = normalizePhoneBR(data.get("phone"));
    if (!phone) { setState("badphone"); return; }
    const name = String(data.get("name") || "").trim().slice(0, 120);
    const purpose = SELLER_PURPOSES.find(p => p.v === data.get("purpose"))?.l || "";
    const type = String(data.get("type") || "");
    const region = String(data.get("region") || "").trim().slice(0, 120);
    const price = String(data.get("price") || "").trim().slice(0, 40);
    const details = `${type} em ${region}${price ? `, valor esperado ${price}` : ""}`;
    window.open(NH.whatsapp(`Olá! Gostaria de anunciar meu imóvel para ${purpose.toLowerCase()}. ${details}. Meu nome é ${name}.`), "_blank", "noopener,noreferrer");
    setState("sending");
    const { saved } = await submitLead({ kind: "seller", name, phone, email: String(data.get("email") || "").trim().slice(0, 200) || null, interest: `Anunciar para ${purpose.toLowerCase()}`.slice(0, 60), message: details.slice(0, 2000) });
    track("seller_lead", { detail: purpose });
    setState(saved ? "sent" : "unsaved");
    if (saved) form.reset();
  };

  return (
    <>
      <div className="grain" />
      <Nav />
      <DemoNotice />
      <main className="page" id="conteudo">
        <div className="seller-layout">
        <div>
        <header className="page-head">
          <span className="eyebrow">Proprietários</span>
          <h1>Anuncie seu <em>imóvel</em></h1>
          <p>Conte o básico sobre o imóvel. Um consultor entra em contato para avaliar, orientar a documentação e divulgar.</p>
        </header>
        <ol className="seller-steps">
          <li><strong>Avaliação gratuita</strong><span>Analisamos o imóvel e o mercado da região para sugerir o valor.</span></li>
          <li><strong>Fotos e divulgação</strong><span>Anúncio com apresentação cuidada, no site e nos canais da New Home.</span></li>
          <li><strong>Visitas acompanhadas</strong><span>Agendamos e acompanhamos cada visita, só com interessados reais.</span></li>
          <li><strong>Documentação até a escritura</strong><span>Orientamos toda a documentação até a conclusão do negócio.</span></li>
        </ol>
        <p className="seller-creci">{NH.name} · CRECI {NH.creci}</p>
        </div>

        <form className="seller-form" onSubmit={submit}>
          <div className="lst-field">
            <label htmlFor="s-name">Nome</label>
            <input id="s-name" name="name" required autoComplete="name" maxLength={120} />
          </div>
          <div className="lst-field">
            <label htmlFor="s-phone">WhatsApp</label>
            <input id="s-phone" name="phone" type="tel" required autoComplete="tel" placeholder="(21) 99999-9999" aria-invalid={state === "badphone"} />
          </div>
          <div className="lst-field">
            <label htmlFor="s-email">E-mail (opcional)</label>
            <input id="s-email" name="email" type="email" autoComplete="email" maxLength={200} />
          </div>
          <div className="lst-field">
            <label htmlFor="s-purpose">Quero</label>
            <select id="s-purpose" name="purpose" defaultValue="sale">
              {SELLER_PURPOSES.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
            </select>
          </div>
          <div className="lst-field">
            <label htmlFor="s-type">Tipo do imóvel</label>
            <select id="s-type" name="type" defaultValue="Apartamento">
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="lst-field">
            <label htmlFor="s-region">Bairro</label>
            <input id="s-region" name="region" required maxLength={120} placeholder="Barra da Tijuca" />
          </div>
          <div className="lst-field">
            <label htmlFor="s-price">Valor esperado (opcional)</label>
            <input id="s-price" name="price" maxLength={40} placeholder="R$ 1.200.000" />
          </div>
          <label className="seller-consent">
            <input name="consent" type="checkbox" required />
            <span>Concordo com a <a href={NH.privacyUrl}>política de privacidade</a> e autorizo o contato da equipe.</span>
          </label>
          {state === "badphone" && <p className="seller-status error" role="alert">Informe um telefone válido com DDD, por exemplo (21) 99999-9999.</p>}
          {state === "sent" && <p className="seller-status ok" role="status">Recebemos seu contato. Abrimos o WhatsApp para continuar a conversa.</p>}
          {state === "unsaved" && <p className="seller-status error" role="alert">Não conseguimos registrar o contato, mas o WhatsApp foi aberto. Continue a conversa por lá.</p>}
          <button type="submit" className="btn-primary seller-submit" disabled={state === "sending"}>{state === "sending" ? "Enviando..." : "Quero anunciar"}</button>
        </form>
        </div>
      </main>
      <Footer />
      <Chat />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SellerPage />);
