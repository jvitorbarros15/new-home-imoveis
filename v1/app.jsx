// New Home Imóveis — public app shell

const APP_DEFAULTS = {
  "motion": window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "off" : "on",
  "density": "regular",
  "accentIntensity": 100
};

function App() {
  const [t] = React.useState(APP_DEFAULTS);

  // apply to <html>
  React.useEffect(() => {
    document.documentElement.setAttribute("data-motion", t.motion);
    document.documentElement.style.setProperty(
      "--accent-l-mult",
      String((t.accentIntensity || 100) / 100)
    );
  }, [t.motion, t.accentIntensity]);

  useReveal();

  return (
    <>
      <div className="grain" />
      <Nav />
      <DemoNotice />
      <Hero motion={t.motion} />
      <Destaques />
      <Bairros />
      <Stats />
      <Sobre />
      <Depoimentos />
      <CTA />
      <Footer />
      <Chat />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
