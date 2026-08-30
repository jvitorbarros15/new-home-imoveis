// Verified public company information shared by every page.
// Source: https://www.imoveisnewhome.com.br/
window.NH = Object.freeze({
  name: "New Home Imóveis",
  legalName: "New Home 2013 Imóveis LTDA",
  foundedYear: 2010,
  creci: "RJ-7609 J",
  address: "Avenida Embaixador Abelardo Bueno, 3500 · Sala 1022 · Barra da Tijuca · Rio de Janeiro / RJ",
  primaryPhone: "+5521997220589",
  primaryPhoneDisplay: "(21) 99722-0589",
  officePhone: "+5521964586464",
  officePhoneDisplay: "(21) 96458-6464",
  email: "erickleonardocorretor@gmail.com",
  instagram: "https://www.instagram.com/imoveisnewhome/",
  instagramHandle: "@imoveisnewhome",
  facebook: "https://www.facebook.com/imoveisnewhome",
  youtube: "https://www.youtube.com/channel/UCAblJQQhgmwDHXV_0-SELYA",
  tiktok: "https://www.tiktok.com/@newhomeimoveis?lang=pt-BR",
  officialSite: "https://www.imoveisnewhome.com.br",
  inventoryUrl: "https://www.imoveisnewhome.com.br/imoveis",
  saleUrl: "https://www.imoveisnewhome.com.br/imoveis/a-venda",
  rentUrl: "https://www.imoveisnewhome.com.br/imoveis/para-alugar",
  listPropertyUrl: "https://www.imoveisnewhome.com.br/cadastre-seu-imovel",
  contactUrl: "https://www.imoveisnewhome.com.br/fale-conosco",
  privacyUrl: "https://www.imoveisnewhome.com.br/politica-de-privacidade",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Avenida+Embaixador+Abelardo+Bueno+3500+Rio+de+Janeiro",
  siteUrl: "https://new-home-imoveis.vercel.app",
  whatsapp(message = "Olá! Gostaria de falar com a New Home Imóveis.") {
    return `https://wa.me/${this.primaryPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  },
});
