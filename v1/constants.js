const PROPERTY_TYPES = ["Apartamento", "Cobertura", "Casa", "Casa em Condomínio", "Penthouse", "Terreno", "Comercial"];

const PRICE_BANDS = {
  sale: [
    { label: "Até R$ 800 mil", min: "", max: 800000 },
    { label: "R$ 800 mil a 1,5 mi", min: 800000, max: 1500000 },
    { label: "R$ 1,5 a 3 mi", min: 1500000, max: 3000000 },
    { label: "Acima de R$ 3 mi", min: 3000000, max: "" },
  ],
  rent: [
    { label: "Até R$ 4 mil", min: "", max: 4000 },
    { label: "R$ 4 a 8 mil", min: 4000, max: 8000 },
    { label: "R$ 8 a 15 mil", min: 8000, max: 15000 },
    { label: "Acima de R$ 15 mil", min: 15000, max: "" },
  ],
};

function parseBRL(text) {
  const digits = String(text ?? "").replace(/\D/g, "").slice(0, 10);
  return digits ? parseInt(digits, 10) : null;
}

function formatBRLInput(raw) {
  const value = parseBRL(raw);
  return value === null ? "" : `R$ ${value.toLocaleString("pt-BR")}`;
}
