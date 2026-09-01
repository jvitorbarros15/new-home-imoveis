// Financiamento page

const BANKS = [
  { name: "Itaú", line: "Consulte as linhas, os critérios e o Custo Efetivo Total diretamente no simulador da instituição.", url: "https://www.itau.com.br/emprestimos-financiamentos/credito-imobiliario" },
  { name: "Santander", line: "Compare as modalidades disponíveis e faça uma simulação oficial conforme o seu perfil.", url: "https://www.santander.com.br/credito/credito-imobiliario" },
  { name: "Banco do Brasil", line: "Consulte condições para imóveis novos ou usados e as regras vigentes para uso do FGTS.", url: "https://www.bb.com.br/site/pra-voce/financiamentos/financiamento-imobiliario/" },
  { name: "Bradesco", line: "Veja prazos, documentos e condições atualizadas no canal oficial do banco.", url: "https://banco.bradesco/html/classic/produtos-servicos/emprestimo-e-financiamento/encontre-seu-credito/credito-imobiliario.shtm" },
  { name: "Caixa", line: "Acesse o simulador habitacional e confira as modalidades disponíveis no momento da contratação.", url: "https://www.caixa.gov.br/voce/habitacao/" },
];

const FAQS = [
  { q: "Quanto preciso ter de entrada?", a: "A entrada mínima varia conforme o banco, a modalidade, o perfil de crédito e o imóvel. Faça simulações oficiais em mais de uma instituição antes de assumir um compromisso." },
  { q: "Posso usar o FGTS?", a: "O FGTS pode ser usado em determinadas operações, desde que o comprador, o imóvel e o financiamento atendam às regras vigentes. O banco responsável deve confirmar a elegibilidade." },
  { q: "Qual é o prazo máximo?", a: "O prazo depende da instituição, da linha escolhida e do perfil do comprador. Um prazo maior reduz a parcela, mas pode aumentar o custo total da operação." },
  { q: "O que é avaliado para aprovar o crédito?", a: "A instituição analisa renda, comprometimento mensal, histórico de crédito, idade, documentação e avaliação do imóvel. Apenas o banco pode aprovar ou recusar o financiamento." },
  { q: "Esta simulação é uma proposta de crédito?", a: "Não. O cálculo abaixo é apenas educativo. A proposta oficial deve informar taxa, sistema de amortização, indexador, seguros, tarifas e o Custo Efetivo Total (CET)." },
];

function BankIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="3 9 12 3 21 9"/><line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="5" y1="9" x2="5" y2="18"/><line x1="9" y1="9" x2="9" y2="18"/>
    <line x1="15" y1="9" x2="15" y2="18"/><line x1="19" y1="9" x2="19" y2="18"/>
    <line x1="3" y1="18" x2="21" y2="18"/><line x1="2" y1="21" x2="22" y2="21"/>
  </svg>;
}

function HowItWorks() {
  return <section className="page-section reveal">
    <div className="page-section-head"><h2>Como <em>se preparar</em></h2><p>Use a estimativa como ponto de partida e confirme as condições no banco.</p></div>
    <div className="steps">
      <div className="step"><span className="step-num">01</span><h4>Organize o orçamento</h4><p>Defina quanto pode usar de entrada e qual parcela cabe com segurança na renda mensal.</p></div>
      <div className="step"><span className="step-num">02</span><h4>Compare propostas</h4><p>Simule em instituições diferentes e compare o CET, o indexador, os seguros, as tarifas e o custo total.</p></div>
      <div className="step"><span className="step-num">03</span><h4>Valide imóvel e documentos</h4><p>O crédito e o imóvel passam por análise. A equipe New Home pode acompanhar as etapas relacionadas à negociação.</p></div>
    </div>
  </section>;
}

function BanksGrid() {
  return <section className="page-section reveal" id="bancos">
    <div className="page-section-head"><h2>Simuladores <em>oficiais</em></h2><p>Links para instituições conhecidas. A New Home não representa os bancos nem garante condições ou aprovação.</p></div>
    <div className="banks">
      {BANKS.map((bank) => <a key={bank.name} className="bank" href={bank.url} target="_blank" rel="noopener noreferrer">
        <div className="bank-mark"><BankIcon/></div>
        <div><div className="bank-tag">Instituição financeira</div><div className="bank-name">{bank.name}</div></div>
        <p className="bank-line">{bank.line}</p>
        <div className="bank-rates"><span>Taxa <b>Consultar</b></span><span>Percentual financiável <b>Sujeito à análise</b></span></div>
        <div className="bank-cta"><span>Abrir site oficial</span><span aria-hidden="true">↗</span></div>
      </a>)}
    </div>
  </section>;
}

function Simulator() {
  const [valor, setValor] = React.useState(1500000);
  const [entrada, setEntrada] = React.useState(0.25);
  const [anos, setAnos] = React.useState(30);
  const [taxa, setTaxa] = React.useState(10.5);
  const principal = Math.max(0, valor * (1 - entrada));
  const monthlyRate = Math.pow(1 + taxa / 100, 1 / 12) - 1;
  const months = anos * 12;
  const parcela = principal > 0 && monthlyRate > 0
    ? principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : 0;
  const totalPago = parcela * months;
  const juros = Math.max(0, totalPago - principal);

  return <section className="page-section reveal" id="simulador">
    <div className="page-section-head"><h2>Estime sua <em>parcela</em></h2><p>Cálculo educativo pelo sistema Price, sem seguros, tarifas ou indexadores.</p></div>
    <div className="sim-wrap">
      <div className="sim-card"><h3>Parâmetros</h3>
        <div className="sim-field">
          <div className="sim-field-head"><label htmlFor="sim-value">Valor do imóvel</label></div>
          <input id="sim-value" className="sim-input" type="text" inputMode="numeric" value={`R$ ${valor.toLocaleString("pt-BR")}`} onChange={(e) => setValor(parseInt(e.target.value.replace(/\D/g, ""), 10) || 0)}/>
        </div>
        <div className="sim-field">
          <div className="sim-field-head"><label htmlFor="sim-entry">Entrada</label><b>{(entrada * 100).toFixed(0)}% · R$ {Math.round(valor * entrada).toLocaleString("pt-BR")}</b></div>
          <input id="sim-entry" className="sim-range" type="range" min={0.1} max={0.6} step={0.05} value={entrada} onChange={(e) => setEntrada(parseFloat(e.target.value))}/>
        </div>
        <div className="sim-field">
          <div className="sim-field-head"><label htmlFor="sim-term">Prazo</label><b>{anos} anos · {months} parcelas</b></div>
          <input id="sim-term" className="sim-range" type="range" min={5} max={35} step={5} value={anos} onChange={(e) => setAnos(parseInt(e.target.value, 10))}/>
        </div>
        <div className="sim-field">
          <div className="sim-field-head"><label htmlFor="sim-rate">Taxa anual efetiva</label><b>{taxa.toFixed(1)}% a.a.</b></div>
          <input id="sim-rate" className="sim-range" type="range" min={5} max={20} step={0.1} value={taxa} onChange={(e) => setTaxa(parseFloat(e.target.value))}/>
        </div>
      </div>
      <aside className="sim-result" aria-live="polite">
        <span className="sim-result-eyebrow">Parcela mensal estimada</span>
        <div className="sim-result-val">R$ {Math.round(parcela).toLocaleString("pt-BR")}<em>/ mês</em></div>
        <div className="sim-result-summary">
          <div><span>Valor financiado</span><b>R$ {Math.round(principal).toLocaleString("pt-BR")}</b></div>
          <div><span>Total estimado</span><b>R$ {Math.round(totalPago).toLocaleString("pt-BR")}</b></div>
          <div><span>Juros estimados</span><b>R$ {Math.round(juros).toLocaleString("pt-BR")}</b></div>
        </div>
        <div className="sim-result-actions">
          <a className="btn-primary" href="#bancos">Comparar nos bancos</a>
          <a className="btn-ghost" href={NH.whatsapp("Olá! Gostaria de orientação sobre a compra de um imóvel financiado.")} target="_blank" rel="noopener noreferrer">Falar com a New Home</a>
        </div>
        <div className="sim-fine">Estimativa pelo sistema Price com conversão de taxa anual efetiva. Não inclui TR ou outro indexador, seguros MIP/DFI, tarifas, avaliação, cartório, impostos nem CET. Bancos podem usar outros sistemas, como SAC. Confirme todos os valores na proposta oficial.</div>
      </aside>
    </div>
  </section>;
}

function FAQ() {
  const [open, setOpen] = React.useState(0);
  return <section className="page-section reveal">
    <div className="page-section-head"><h2>Perguntas <em>frequentes</em></h2><p>Informações gerais para começar. Regras e condições devem ser confirmadas com a instituição financeira.</p></div>
    <div className="faq">{FAQS.map((item, index) => {
      const expanded = open === index;
      return <div key={item.q} className={`faq-item ${expanded ? "open" : ""}`}>
        <button type="button" className="faq-q" aria-expanded={expanded} aria-controls={`faq-answer-${index}`} onClick={() => setOpen(expanded ? -1 : index)}>
          <span>{item.q}</span><span className="faq-icon" aria-hidden="true">+</span>
        </button>
        <div className="faq-a" id={`faq-answer-${index}`}><p>{item.a}</p></div>
      </div>;
    })}</div>
  </section>;
}

function FinanciamentoApp() {
  const [theme] = React.useState({ motion: "on" });
  React.useEffect(() => {
    document.documentElement.setAttribute("data-motion", theme.motion);
  }, [theme.motion]);
  useReveal();
  return <><div className="grain"/><Nav/>
    <main className="page">
      <section className="ph-hero">
        <div><span className="eyebrow ph-hero-eyebrow">Planejamento financeiro</span><h1>Entenda os números<br/>antes das <em>chaves</em>.</h1><p>Faça uma estimativa inicial, compare propostas oficiais e avalie o custo total antes de contratar um financiamento.</p></div>
        <div className="ph-hero-meta"><dl>
          <div><dt>Estimativa</dt><dd>Price</dd></div><div><dt>Comparação</dt><dd>CET</dd></div>
          <div><dt>Taxas</dt><dd style={{fontSize:22}}>No banco</dd></div><div><dt>Aprovação</dt><dd style={{fontSize:22}}>Sujeita à análise</dd></div>
        </dl></div>
      </section>
      <div className="page-wrap"><HowItWorks/><BanksGrid/><Simulator/><FAQ/></div>
      <section className="page-cta reveal"><div><h3>Vai comprar um imóvel <em>financiado</em>?</h3><p>Fale com a New Home sobre o imóvel e as etapas da negociação. A análise e a aprovação do crédito são feitas exclusivamente pelo banco.</p></div>
        <div className="page-cta-actions"><a className="primary" href={NH.whatsapp("Olá! Gostaria de orientação sobre a compra de um imóvel financiado.")} target="_blank" rel="noopener noreferrer">Falar com a New Home</a><a className="ghost" href="quem-somos.html">Sobre a empresa</a></div>
      </section>
    </main><Footer/><Chat/></>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<FinanciamentoApp/>);
