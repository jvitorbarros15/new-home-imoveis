// LGPD notice for the data this site actually collects.

function PrivacyPage() {
  useReveal();
  return (
    <>
      <div className="grain" />
      <Nav />
      <DemoNotice />
      <main className="page page-prose" id="conteudo">
        <header className="page-head">
          <span className="eyebrow">LGPD · Lei 13.709/2018</span>
          <h1>Política de <em>privacidade</em></h1>
          <p>Como este site trata dados pessoais. Última atualização: setembro de 2026.</p>
        </header>

        <section className="blk reveal">
          <h2>Quem opera este site</h2>
          <p>
            Este endereço hospeda um projeto de portfólio, criado para demonstrar desenvolvimento web.
            Ele não é operado pela empresa cujo nome e identidade visual serviram de referência, nem
            possui vínculo, afiliação ou endosso dela. Os dados de contato exibidos são ilustrativos.
          </p>
        </section>

        <section className="blk reveal">
          <h2>Quais dados são coletados</h2>
          <ul className="prose-list">
            <li>
              <strong>Formulário de contato:</strong> nome, telefone, e-mail e o tipo de interesse
              selecionado. São informados voluntariamente por você ao pedir atendimento.
            </li>
            <li>
              <strong>Métricas de uso:</strong> contadores anônimos de eventos, como abertura de uma
              ficha de imóvel ou clique no botão de WhatsApp. Não incluem nome, IP, e-mail ou qualquer
              identificador pessoal.
            </li>
            <li>
              <strong>Preferências locais:</strong> tema claro/escuro e imóveis favoritados ficam
              apenas no armazenamento do seu navegador (<code>localStorage</code>) e nunca são enviados
              a nenhum servidor.
            </li>
          </ul>
          <p>Este site não usa cookies de rastreamento, publicidade ou perfilamento comportamental.</p>
        </section>

        <section className="blk reveal">
          <h2>Para que os dados são usados</h2>
          <p>
            Os dados do formulário são usados exclusivamente para retornar o contato solicitado. A base
            legal é o consentimento fornecido no envio do formulário (art. 7º, I da LGPD). Ao enviar,
            os dados são gravados e, em seguida, o WhatsApp é aberto com uma mensagem pré-preenchida
            para que você inicie a conversa se quiser.
          </p>
        </section>

        <section className="blk reveal">
          <h2>Com quem são compartilhados</h2>
          <p>
            Os registros ficam armazenados em infraestrutura da Supabase e a hospedagem do site é feita
            pela Vercel. Nenhum dado é vendido, cedido ou usado para publicidade. Se você optar por
            continuar no WhatsApp, a conversa passa a ser regida pela política da Meta.
          </p>
        </section>

        <section className="blk reveal">
          <h2>Por quanto tempo são mantidos</h2>
          <p>
            Contatos são mantidos enquanto durar o atendimento e removidos em seguida, ou imediatamente
            mediante solicitação. Métricas anônimas não permitem identificar uma pessoa e são mantidas
            de forma agregada.
          </p>
        </section>

        <section className="blk reveal">
          <h2>Seus direitos</h2>
          <p>
            A LGPD garante confirmação de tratamento, acesso, correção, anonimização, portabilidade,
            revogação do consentimento e eliminação dos seus dados. Para exercer qualquer um deles,
            escreva para <a href={`mailto:${NH.email}`}>{NH.email}</a> ou fale pelo{" "}
            <a href={NH.whatsapp("Olá! Gostaria de tratar de dados pessoais (LGPD).")}
               target="_blank" rel="noopener noreferrer">WhatsApp</a>. O pedido é atendido em até 15 dias.
          </p>
          <p>
            Para apagar as preferências guardadas no seu navegador, limpe os dados do site nas
            configurações do navegador — isso remove tema e favoritos imediatamente.
          </p>
        </section>

        <section className="blk reveal">
          <h2>Segurança</h2>
          <p>
            O site é servido apenas por HTTPS, com HSTS e Content Security Policy restritiva. O acesso
            administrativo exige autenticação e autorização explícita por usuário, e todas as tabelas
            usam Row Level Security no banco de dados.
          </p>
        </section>
      </main>
      <Footer />
      <Chat />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PrivacyPage />);
