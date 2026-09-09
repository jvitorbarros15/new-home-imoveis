// Admin — create / edit property form

const TIPOS = ["Apartamento", "Cobertura", "Casa", "Casa em Condomínio", "Penthouse", "Terreno", "Comercial"];
const STATUSES = [{ v: "active", l: "Ativo" }, { v: "sold", l: "Vendido" }, { v: "rented", l: "Alugado" }];
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTS  = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_FILE_SIZE = 10485760; // 10 MB
const WEBP_MAX_EDGE = 2200;
const WEBP_QUALITY = 0.82;

function sanitizeUrl(url) {
  const s = url.trim();
  if (!s) return "";
  if (s.startsWith("https://")) return s;
  return ""; // reject anything that isn't https
}

function validateFiles(files) {
  const errors = [];
  Array.from(files).forEach(f => {
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(f.type) || !ALLOWED_EXTS.includes(ext)) {
      errors.push(`${f.name}: tipo de arquivo não permitido.`);
    } else if (f.size > MAX_FILE_SIZE) {
      errors.push(`${f.name}: arquivo maior que 10 MB.`);
    }
  });
  return errors;
}

// Photos come off phones as multi-megabyte JPEGs. Re-encoding to WebP in the
// browser cuts transfer and storage without a server-side pipeline.
async function toWebp(file) {
  if (file.type === "image/webp") return file;
  if (typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, WEBP_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch (e) {
    return file;
  }
}

function clamp(v, min, max) {
  const n = parseInt(v, 10);
  if (isNaN(n)) return "";
  return String(Math.max(min, Math.min(max, n)));
}

function PropertyForm({ prop, onSaved }) {
  const isEdit = !!prop;

  const [fields, setFields] = React.useState({
    code:           prop?.code          || "",
    title:          prop?.title         || "",
    type:           prop?.type          || "Apartamento",
    status:         prop?.status        || "active",
    region:         prop?.region        || "",
    address:        prop?.address       || "",
    price_brl:      prop ? (prop.price_brl / 100).toString() : "",
    area_m2:        prop?.area_m2 != null ? prop.area_m2.toString() : "",
    bedrooms:       prop?.bedrooms != null ? prop.bedrooms.toString() : "",
    suites:         prop?.suites != null ? prop.suites.toString() : "",
    bathrooms:      prop?.bathrooms != null ? prop.bathrooms.toString() : "",
    parking:        prop?.parking != null ? prop.parking.toString() : "",
    condominio_brl: prop?.condominio_brl != null ? (prop.condominio_brl / 100).toString() : "",
    iptu_brl:       prop?.iptu_brl != null ? (prop.iptu_brl / 100).toString() : "",
    description:    prop?.description   || "",
    tour_url:       prop?.tour_url      || "",
    pet_friendly:   prop?.pet_friendly  ?? false,
    featured:       prop?.featured      ?? false,
  });

  const [images, setImages]       = React.useState(prop?.images || []);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving]       = React.useState(false);
  const [error, setError]         = React.useState("");
  const [drag, setDrag]           = React.useState(false);
  const fileRef = React.useRef(null);

  function set(k, v) { setFields(f => ({ ...f, [k]: v })); }

  async function uploadFiles(files) {
    const errs = validateFiles(files);
    if (errs.length > 0) { setError(errs.join(" ")); return; }
    setError("");
    setUploading(true);
    const codeSlug = (fields.code || "temp").replace(/[^a-zA-Z0-9-]/g, "_");
    const urls = [];

    for (const original of Array.from(files)) {
      const file = await toWebp(original);
      const ext  = file.name.split(".").pop().toLowerCase();
      const rand = Math.random().toString(16).slice(2, 10);
      const path = `${codeSlug}/${Date.now()}-${rand}.${ext}`;
      const { error: upErr } = await window.sb.storage
        .from("property-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) {
        setError("Erro ao enviar uma ou mais imagens. Verifique o tamanho e o formato.");
        continue;
      }
      const { data } = window.sb.storage.from("property-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    setImages(prev => [...prev, ...urls]);
    setUploading(false);
  }

  function removeImage(url) { setImages(prev => prev.filter(u => u !== url)); }

  function moveImage(index, delta) {
    setImages(prev => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = prev.slice();
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function validate() {
    if (!fields.code.trim())   return "Código é obrigatório.";
    if (fields.code.length > 32) return "Código deve ter no máximo 32 caracteres.";
    if (!fields.title.trim())  return "Título é obrigatório.";
    if (fields.title.length > 200) return "Título deve ter no máximo 200 caracteres.";
    if (!fields.region.trim()) return "Região é obrigatória.";
    if (fields.region.length > 100) return "Região deve ter no máximo 100 caracteres.";
    if (fields.address.length > 300) return "Endereço deve ter no máximo 300 caracteres.";
    if (fields.description.length > 5000) return "Descrição deve ter no máximo 5000 caracteres.";
    const price = parseFloat(fields.price_brl);
    if (!fields.price_brl || isNaN(price) || price <= 0) return "Preço é obrigatório e deve ser positivo.";
    if (price > 999999999) return "Preço inválido.";
    const tourClean = sanitizeUrl(fields.tour_url);
    if (fields.tour_url.trim() && !tourClean) return "URL do Tour 360° deve começar com https://";
    return null;
  }

  async function save(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setSaving(true); setError("");

    const payload = {
      code:           fields.code.trim(),
      title:          fields.title.trim(),
      type:           fields.type,
      status:         fields.status,
      region:         fields.region.trim(),
      address:        fields.address.trim() || null,
      price_brl:      Math.round(parseFloat(fields.price_brl) * 100),
      area_m2:        fields.area_m2   ? parseFloat(fields.area_m2)    : null,
      bedrooms:       fields.bedrooms  ? parseInt(fields.bedrooms, 10)  : null,
      suites:         fields.suites    ? parseInt(fields.suites, 10)    : null,
      bathrooms:      fields.bathrooms ? parseInt(fields.bathrooms, 10) : null,
      parking:        fields.parking   ? parseInt(fields.parking, 10)   : null,
      condominio_brl: fields.condominio_brl ? Math.round(parseFloat(fields.condominio_brl) * 100) : 0,
      iptu_brl:       fields.iptu_brl  ? Math.round(parseFloat(fields.iptu_brl) * 100) : 0,
      description:    fields.description.trim() || null,
      tour_url:       sanitizeUrl(fields.tour_url) || null,
      pet_friendly:   fields.pet_friendly,
      featured:       fields.featured,
      images:         images.length > 0 ? images : null,
    };

    let dbError;
    if (isEdit) {
      const { error: err } = await window.sb.from("properties").update(payload).eq("id", prop.id);
      dbError = err;
    } else {
      const { error: err } = await window.sb.from("properties").insert(payload);
      dbError = err;
    }

    setSaving(false);
    if (dbError) {
      if (dbError.code === "23505") {
        setError("Já existe um imóvel com esse código. Use um código único.");
      } else {
        setError("Erro ao salvar. Verifique os dados e tente novamente.");
      }
      return;
    }
    onSaved();
  }

  function Field({ label, id, children, full }) {
    return (
      <div className={`adm-field${full ? " adm-field-full" : ""}`}>
        <label htmlFor={id}>{label}</label>
        {children}
      </div>
    );
  }

  return (
    <>
      <div className="adm-header">
        <div>
          <h1 className="adm-title">{isEdit ? "Editar imóvel" : "Novo imóvel"}</h1>
          <p className="adm-subtitle">{isEdit ? `Editando ${prop.code}` : "Preencha os dados do imóvel"}</p>
        </div>
      </div>

      <form className="adm-form" onSubmit={save} noValidate>

        {/* Identification */}
        <div className="adm-card" style={{ padding: 24 }}>
          <p className="adm-section-label">Identificação</p>
          <div className="adm-form-row">
            <Field label="Código *" id="f-code">
              <input id="f-code" value={fields.code} maxLength={32}
                onChange={e => set("code", e.target.value)} placeholder="AP9830-NHB"
                required disabled={isEdit} autoComplete="off" />
            </Field>
            <Field label="Tipo *" id="f-type">
              <select id="f-type" value={fields.type} onChange={e => set("type", e.target.value)}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div className="adm-form-row" style={{ marginTop: 16 }}>
            <Field label="Título *" id="f-title" full>
              <input id="f-title" value={fields.title} maxLength={200}
                onChange={e => set("title", e.target.value)}
                placeholder="Cobertura duplex com vista para o Cristo" required />
            </Field>
          </div>
          <div className="adm-form-row" style={{ marginTop: 16 }}>
            <Field label="Região *" id="f-region">
              <input id="f-region" value={fields.region} maxLength={100}
                onChange={e => set("region", e.target.value)}
                placeholder="Barra da Tijuca · Rio de Janeiro" required />
            </Field>
            <Field label="Endereço completo" id="f-address">
              <input id="f-address" value={fields.address} maxLength={300}
                onChange={e => set("address", e.target.value)}
                placeholder="Av. das Américas 3434 · Barra da Tijuca · RJ" />
            </Field>
          </div>
          <div className="adm-form-row" style={{ marginTop: 16 }}>
            <Field label="Status" id="f-status">
              <select id="f-status" value={fields.status} onChange={e => set("status", e.target.value)}>
                {STATUSES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </Field>
            <div className="adm-field" style={{ justifyContent: "flex-end" }}>
              <label className="adm-check">
                <input type="checkbox" id="f-pet" checked={fields.pet_friendly}
                  onChange={e => set("pet_friendly", e.target.checked)} />
                Aceita pets
              </label>
              <label className="adm-check">
                <input type="checkbox" id="f-featured" checked={fields.featured}
                  onChange={e => set("featured", e.target.checked)} />
                Destacar na home
              </label>
            </div>
          </div>
        </div>

        {/* Price + specs */}
        <div className="adm-card" style={{ padding: 24 }}>
          <p className="adm-section-label">Valores e metragem</p>
          <div className="adm-form-row-3">
            <Field label="Preço (R$) *" id="f-price">
              <input id="f-price" type="number" value={fields.price_brl} min="1" max="999999999" step="1"
                onChange={e => set("price_brl", e.target.value)} placeholder="1950000" required />
            </Field>
            <Field label="Condomínio (R$/mês)" id="f-cond">
              <input id="f-cond" type="number" value={fields.condominio_brl} min="0" step="1"
                onChange={e => set("condominio_brl", e.target.value)} placeholder="3500" />
            </Field>
            <Field label="IPTU (R$/mês)" id="f-iptu">
              <input id="f-iptu" type="number" value={fields.iptu_brl} min="0" step="1"
                onChange={e => set("iptu_brl", e.target.value)} placeholder="800" />
            </Field>
          </div>
          <div className="adm-form-row-3" style={{ marginTop: 16 }}>
            <Field label="Área útil (m²)" id="f-area">
              <input id="f-area" type="number" value={fields.area_m2} min="0" max="99999" step="0.01"
                onChange={e => set("area_m2", e.target.value)} placeholder="113" />
            </Field>
            <Field label="Quartos" id="f-bed">
              <input id="f-bed" type="number" value={fields.bedrooms} min="0" max="99"
                onChange={e => set("bedrooms", clamp(e.target.value, 0, 99))} />
            </Field>
            <Field label="Suítes" id="f-suite">
              <input id="f-suite" type="number" value={fields.suites} min="0" max="99"
                onChange={e => set("suites", clamp(e.target.value, 0, 99))} />
            </Field>
          </div>
          <div className="adm-form-row" style={{ marginTop: 16 }}>
            <Field label="Banheiros" id="f-bath">
              <input id="f-bath" type="number" value={fields.bathrooms} min="0" max="99"
                onChange={e => set("bathrooms", clamp(e.target.value, 0, 99))} />
            </Field>
            <Field label="Vagas de garagem" id="f-park">
              <input id="f-park" type="number" value={fields.parking} min="0" max="99"
                onChange={e => set("parking", clamp(e.target.value, 0, 99))} />
            </Field>
          </div>
        </div>

        {/* Description + tour */}
        <div className="adm-card" style={{ padding: 24 }}>
          <p className="adm-section-label">Descrição</p>
          <Field label="Texto de apresentação" id="f-desc">
            <textarea id="f-desc" value={fields.description} maxLength={5000} rows={5}
              onChange={e => set("description", e.target.value)}
              placeholder="Descreva o imóvel com detalhes sobre localização, acabamento, diferenciais..." />
          </Field>
          <div style={{ marginTop: 16 }}>
            <Field label="URL do Tour 360° (Matterport — deve começar com https://)" id="f-tour">
              <input id="f-tour" type="url" value={fields.tour_url}
                onChange={e => set("tour_url", e.target.value)}
                placeholder="https://my.matterport.com/show/?m=XXXXX"
                pattern="https://.*" />
            </Field>
          </div>
        </div>

        {/* Images */}
        <div className="adm-card" style={{ padding: 24 }}>
          <p className="adm-section-label">Fotos (JPG, PNG, WebP · máx 10 MB por arquivo · convertidas para WebP no envio)</p>
          <div
            className={`adm-upload-area ${drag ? "drag" : ""}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); uploadFiles(e.dataTransfer.files); }}
            role="button" tabIndex={0} aria-label="Área de upload de fotos"
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") fileRef.current.click(); }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                 style={{ margin: "0 auto", color: "var(--ink-3)" }} aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p><span>Clique para enviar</span> ou arraste as fotos aqui</p>
            {uploading && <p style={{ color: "var(--accent)", marginTop: 8 }}>Enviando...</p>}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                   multiple style={{ display: "none" }} tabIndex={-1}
                   onChange={e => { uploadFiles(e.target.files); e.target.value = ""; }} />
          </div>
          {images.length > 0 && (
            <div className="adm-img-grid" role="list" aria-label="Fotos do imóvel">
              {images.map((url, i) => (
                <div key={url} className="adm-img-thumb" role="listitem">
                  <img src={url} alt={`Foto ${i + 1}${i === 0 ? " (capa)" : ""}`} loading="lazy" />
                  {i === 0 && <span className="adm-img-cover">Capa</span>}
                  <div className="adm-img-order">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}
                            aria-label={`Mover foto ${i + 1} para trás`}>←</button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}
                            aria-label={`Mover foto ${i + 1} para frente`}>→</button>
                  </div>
                  <button
                    type="button" className="adm-img-remove"
                    onClick={() => removeImage(url)}
                    aria-label={`Remover foto ${i + 1}`}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="adm-error" role="alert" aria-live="assertive">{error}</div>}

        <div style={{ display: "flex", gap: 12, paddingBottom: 40 }}>
          <button type="submit" className="adm-btn adm-btn-primary"
                  disabled={saving || uploading} aria-busy={saving}>
            {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar imóvel"}
          </button>
          <button type="button" className="adm-btn adm-btn-ghost" onClick={onSaved}>
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}
