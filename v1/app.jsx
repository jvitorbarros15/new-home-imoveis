// New Home Imóveis — public app shell

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "brand": "aurum",
  "motion": window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "off" : "on",
  "density": "regular",
  "accentIntensity": 100
}/*EDITMODE-END*/;

function App() {
  const [t] = React.useState(TWEAK_DEFAULTS);

  // apply to <html>
  React.useEffect(() => {
    document.documentElement.setAttribute("data-brand", t.brand);
    document.documentElement.setAttribute("data-motion", t.motion);
    document.documentElement.style.setProperty(
      "--accent-l-mult",
      String((t.accentIntensity || 100) / 100)
    );
  }, [t.brand, t.motion, t.accentIntensity]);

  useReveal();

  return (
    <>
      <div className="grain" />
      <Nav brand={t.brand} />
      <Hero motion={t.motion} />
      <Destaques />
      <Bairros />
      <Stats />
      <Sobre />
      <Depoimentos />
      <CTA />
      <Footer brand={t.brand} />
      <Chat brand={t.brand} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
