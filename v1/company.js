// Company information used by this portfolio build. This site is an
// independent demonstration project and is not operated by, affiliated with or
// endorsed by the company it takes its visual reference from.
window.NH = Object.freeze({
  name: "New Home Imóveis",
  legalName: "New Home 2013 Imóveis LTDA",
  foundedYear: 2010,
  creci: "00000-J",
  address: "Avenida Embaixador Abelardo Bueno, 3500 · Sala 1022 · Barra da Tijuca · Rio de Janeiro / RJ",
  primaryPhone: "+5521900000000",
  primaryPhoneDisplay: "(21) 90000-0000",
  officePhone: "+5521900000001",
  officePhoneDisplay: "(21) 90000-0001",
  email: "contato@example.com",
  instagram: "https://www.instagram.com/imoveisnewhome/",
  instagramHandle: "@imoveisnewhome",
  facebook: "https://www.facebook.com/imoveisnewhome",
  youtube: "https://www.youtube.com/channel/UCAblJQQhgmwDHXV_0-SELYA",
  tiktok: "https://www.tiktok.com/@newhomeimoveis?lang=pt-BR",
  officialSite: "https://www.imoveisnewhome.com.br",
  inventoryUrl: "https://www.imoveisnewhome.com.br/imoveis",
  saleUrl: "https://www.imoveisnewhome.com.br/imoveis/a-venda",
  rentUrl: "https://www.imoveisnewhome.com.br/imoveis/para-alugar",
  listPropertyUrl: "/anunciar",
  contactUrl: "https://www.imoveisnewhome.com.br/fale-conosco",
  privacyUrl: "/privacidade",
  externalPrivacyUrl: "https://www.imoveisnewhome.com.br/politica-de-privacidade",
  listingsUrl: "/imoveis",
  favoritesUrl: "/favoritos",
  isDemo: true,
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Avenida+Embaixador+Abelardo+Bueno+3500+Rio+de+Janeiro",
  siteUrl: window.NEW_HOME_CONFIG?.siteUrl || "https://new-home-imoveis.vercel.app",
  whatsapp(message = "Olá! Gostaria de falar com a New Home Imóveis.") {
    return `https://wa.me/${this.primaryPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  },
});
