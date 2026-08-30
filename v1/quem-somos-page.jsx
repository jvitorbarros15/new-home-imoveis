// Quem Somos page

function QuemSomos() {
  const yearsInMarket = new Date().getFullYear() - NH.foundedYear;

  return (
    <main className="page">
      <section className="ph-hero">
        <div>
          <span className="eyebrow ph-hero-eyebrow">Quem somos</span>
          <h1>Desde 2010,<br/>aproximando pessoas<br/>de uma <em>boa casa</em>.</h1>
          <p>A New Home Imóveis nasceu no Rio de Janeiro e é especializada na Barra da Tijuca, no Recreio e na Região Olímpica. A equipe conecta construtoras, proprietários e compradores qualificados com atendimento próximo e estratégia digital.</p>
        </div>
        <div className="ph-hero-meta">
          <dl>
            <div><dt>Fundação</dt><dd>{NH.foundedYear}</dd></div>
            <div><dt>Experiência</dt><dd>{yearsInMarket}<em>anos</em></dd></div>
            <div><dt>Vendas acumuladas</dt><dd>R$ 600<em>milhões+</em></dd></div>
            <div><dt>CRECI</dt><dd style={{ fontSize: 22, letterSpacing: 0 }}>{NH.creci}</dd></div>
          </dl>
        </div>
      </section>

      <div className="page-wrap">
        <section className="page-section reveal">
          <div className="qs-manifesto">
            <div className="qs-figure" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80&auto=format&fit=crop)" }} role="img" aria-label="Vista urbana da Barra da Tijuca">
              <div className="qs-figure-caption"><span><b>BARRA DA TIJUCA</b></span><span>RIO DE JANEIRO</span></div>
            </div>
            <div className="qs-copy">
              <span className="eyebrow" style={{ color: "var(--accent)" }}>Nossa atuação</span>
              <p className="qs-lede">Comprar ou vender um imóvel começa por entender pessoas. Por isso, cada atendimento parte das necessidades reais do cliente e segue com acompanhamento até a conclusão da negociação.</p>
              <p>Especializada na intermediação de imóveis e empreendimentos na <b>Barra da Tijuca, Recreio e Região Olímpica</b>, a New Home atua desde 2010 e já ultrapassou <b>R$ 600 milhões em vendas</b>.</p>
              <p>O trabalho combina conhecimento da região, divulgação digital e atendimento consultivo para aproximar imóveis de compradores qualificados.</p>
              <div className="qs-pull">“Mais do que metragem, buscamos o imóvel que faz sentido para cada momento de vida.”</div>
            </div>
          </div>
        </section>

        <section className="page-section reveal">
          <div className="page-section-head">
            <h2>Nossa <em>trajetória</em></h2>
            <p>Uma atuação construída com especialização regional, estratégia digital e relacionamento próximo.</p>
          </div>
          <div className="timeline">
            <div className="tl-step"><div className="tl-year">2010</div><h4>Início da New Home</h4><p>A empresa inicia sua atuação no mercado imobiliário do Rio de Janeiro.</p></div>
            <div className="tl-step"><div className="tl-year">Região</div><h4>Especialização local</h4><p>Foco na Barra da Tijuca, no Recreio e nos bairros da Região Olímpica.</p></div>
            <div className="tl-step"><div className="tl-year">Digital</div><h4>Compradores qualificados</h4><p>Estratégias digitais aproximam construtoras e proprietários de potenciais compradores.</p></div>
            <div className="tl-step"><div className="tl-year">Hoje</div><h4>R$ 600 milhões+</h4><p>Mais de R$ 600 milhões em vendas acumuladas e milhares de clientes atendidos.</p></div>
          </div>
        </section>

        <section className="page-section reveal">
          <div className="page-section-head"><h2>O que <em>nos guia</em></h2><p>Princípios que orientam a busca, a divulgação e cada etapa da negociação.</p></div>
          <div className="valores">
            <div className="valor"><span className="valor-num">01</span><h4>Escuta</h4><p>Entender as prioridades do cliente antes de recomendar um imóvel.</p></div>
            <div className="valor"><span className="valor-num">02</span><h4>Conhecimento local</h4><p>Atuação concentrada nas regiões em que a equipe conhece o mercado e o dia a dia.</p></div>
            <div className="valor"><span className="valor-num">03</span><h4>Atendimento próximo</h4><p>Acompanhamento consultivo da primeira conversa à conclusão da negociação.</p></div>
            <div className="valor"><span className="valor-num">04</span><h4>Estratégia</h4><p>Divulgação digital e qualificação de interessados para tornar o processo mais eficiente.</p></div>
          </div>
        </section>

        <section className="page-section reveal">
          <div className="page-section-head"><h2>Onde <em>nos encontrar</em></h2><p>Atendimento presencial com hora marcada. Confirme o horário antes de se deslocar.</p></div>
          <div className="matriz">
            <div className="matriz-info">
              <h4>Escritório · Barra da Tijuca</h4><h3>{NH.name}</h3>
              <address><b>Avenida Embaixador Abelardo Bueno, 3500</b><br/>Sala 1022 · Barra da Tijuca<br/>Rio de Janeiro / RJ · CEP 22775-040</address>
              <ul>
                <li><a href={`tel:${NH.primaryPhone}`}>{NH.primaryPhoneDisplay}</a></li>
                <li><a href={`tel:${NH.officePhone}`}>{NH.officePhoneDisplay}</a></li>
                <li><a href={`mailto:${NH.email}`}>{NH.email}</a></li>
              </ul>
              <div className="matriz-meta"><span>CRECI {NH.creci}</span><span>Atendimento com hora marcada</span></div>
            </div>
            <a className="matriz-map" href={NH.mapUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir endereço da New Home no mapa">
              <div className="map-grid"/><div className="road r1"/><div className="road r2"/><div className="road r3"/>
              <div className="pin" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <div className="pin-label">Abrir Av. Abelardo Bueno, 3500 no mapa</div>
            </a>
          </div>
        </section>
      </div>

      <section className="page-cta reveal">
        <div><h3>Vamos <em>conversar</em>?</h3><p>Conte o que procura e fale diretamente com a equipe New Home.</p></div>
        <div className="page-cta-actions">
          <a className="primary" href={NH.whatsapp("Olá! Gostaria de falar com a equipe New Home.")} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          <a className="ghost" href="index.html#contato">Enviar mensagem</a>
        </div>
      </section>
    </main>
  );
}

function QuemSomosApp() {
  const [t] = React.useState({ brand: "aurum", motion: "on" });
  React.useEffect(() => {
    document.documentElement.setAttribute("data-brand", t.brand);
    document.documentElement.setAttribute("data-motion", t.motion);
  }, [t.brand, t.motion]);
  useReveal();
  return <><div className="grain"/><Nav brand={t.brand}/><QuemSomos/><Footer brand={t.brand}/><Chat brand={t.brand}/></>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<QuemSomosApp/>);
