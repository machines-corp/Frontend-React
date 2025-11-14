  import { useEffect, useMemo, useState } from "react";
  import "./jobposting-form.css";

  const API_BASE = "http://localhost:8080"; // ajusta si usas proxy

  const initial = {
    // FKs amigables:
    source_name: "",
    company_name: "",
    country: "Chile",
    city: "",
    location_text: "",

    // Campos del JobPosting:
    title: "",
    url: "",
    seniority: "",
    modality: "",
    schedule: "Completa",
    currency: "CLP",
    salary_min: "",
    salary_max: "",
    salary_text: "", // si tu modelo lo tiene
    role: "",
    area: "",
    description: "",
    benefits: [], // lista de strings
  };

  export default function JobPostingForm() {
    const [form, setForm] = useState(initial);
    const [choices, setChoices] = useState({});
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
      (async () => {
        try {
          const r = await fetch(`${API_BASE}/api/jobpostings/choices`);
          const data = await r.json();
          setChoices(data.choices || {});
        } catch (e) {
          setChoices({
            modality: ["Remoto", "Híbrido", "Presencial"],
            seniority: ["Junior", "Semi", "Senior"],
            currency: ["USD", "CLP"],
            schedule: ["Completa", "Parcial"],
          });
        }
      })();
    }, []);

    const canSubmit = useMemo(() => {
      return (
        form.title.trim() &&
        form.company_name.trim() &&
        form.source_name.trim() &&
        (form.url.trim() || true) && // si tu modelo exige url, cambia a '&& form.url.trim()'
        form.seniority &&
        form.modality &&
        form.currency &&
        form.country.trim() !== ""
      );
    }, [form]);

    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const toggleBenefit = (name) => {
      setForm((f) => {
        const exists = f.benefits.includes(name);
        const benefits = exists
          ? f.benefits.filter((b) => b !== name)
          : [...f.benefits, name];
        return { ...f, benefits };
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!canSubmit || busy) return;

      setBusy(true);
      setMsg(null);

      // Payload limpio: castea numéricos y elimina vacíos no necesarios
      const payload = { ...form };
      ["salary_min", "salary_max"].forEach((k) => {
        if (payload[k] === "" || payload[k] === null) delete payload[k];
        else payload[k] = Number(payload[k]);
      });
      if (!payload.salary_text) delete payload.salary_text;
      if (!payload.role) delete payload.role;
      if (!payload.area) delete payload.area;
      if (!payload.description) delete payload.description;
      if (!payload.city) delete payload.city;
      if (!payload.location_text) delete payload.location_text;
      if (!payload.url) delete payload.url;

      try {
        const r = await fetch(`${API_BASE}/api/jobpostings/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await r.json();

        if (!r.ok) {
          setMsg({ type: "err", text: data?.error || "Error al crear la oferta." });
        } else {
          setMsg({ type: "ok", text: "¡Oferta creada correctamente!" });
          setForm(initial);
        }
      } catch (err) {
        setMsg({ type: "err", text: "No se pudo conectar con el servidor." });
      } finally {
        setBusy(false);
        setTimeout(() => setMsg(null), 3500);
      }
    };

    return (
      <div className="jp-form-container">
        <div className="jp-card">
          <h2 className="jp-title">Crear oferta</h2>
          <p className="jp-subtitle">
            Completa los datos principales. Los campos con * son obligatorios.
          </p>

          <form className="jp-form" onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="field">
                <label>Título *</label>
                <input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Ej: Desarrollador Backend"
                />
              </div>

              <div className="field">
                <label>URL de la oferta</label>
                <input
                  value={form.url}
                  onChange={(e) => update("url", e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              </div>

              <div className="field">
                <label>Empresa *</label>
                <input
                  value={form.company_name}
                  onChange={(e) => update("company_name", e.target.value)}
                  placeholder="Nombre de la empresa"
                />
              </div>

              <div className="field">
                <label>Fuente / Portal *</label>
                <input
                  value={form.source_name}
                  onChange={(e) => update("source_name", e.target.value)}
                  placeholder="Ej: Laborum"
                />
              </div>

              <div className="field">
                <label>Seniority *</label>
                <select
                  className="ui-select"
                  value={form.seniority}
                  onChange={(e) => update("seniority", e.target.value)}
                  >
                  <option value="">Selecciona…</option>
                  {(choices.seniority || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                  ))}
                  </select>
              </div>

              <div className="field">
                <label>Modalidad *</label>
                <select
                  className="ui-select"
                  value={form.modality}
                  onChange={(e) => update("modality", e.target.value)}
                  >
                  <option value="">Selecciona…</option>
                  {(choices.modality || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                  ))}
                  </select>
              </div>

              <div className="field">
                <label>Jornada</label>
                <select
                  className="ui-select"
                  value={form.schedule}
                  onChange={(e) => update("schedule", e.target.value)}
                  >
                  {(choices.schedule || ["Completa", "Parcial"]).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                  ))}
                  </select>
              </div>

              <div className="field">
                <label>País *</label>
                <input
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="Ej: Chile"
                />
              </div>

              <div className="field">
                <label>Ciudad</label>
                <input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Ej: Santiago"
                />
              </div>

              <div className="field">
                <label>Ubicación (texto)</label>
                <input
                  value={form.location_text}
                  onChange={(e) => update("location_text", e.target.value)}
                  placeholder="Remoto en Chile / Híbrido en Santiago…"
                />
              </div>

              <div className="field">
                <label>Moneda *</label>
                <select
                  className="ui-select"
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  >
                  <option value="">Selecciona…</option>
                  {(choices.currency || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                  ))}
                  </select>
              </div>

              <div className="field">
                <label>Salario mín.</label>
                <input
                  type="number"
                  value={form.salary_min}
                  onChange={(e) => update("salary_min", e.target.value)}
                  placeholder="Ej: 1200000"
                  min="0"
                />
              </div>

              <div className="field">
                <label>Salario máx.</label>
                <input
                  type="number"
                  value={form.salary_max}
                  onChange={(e) => update("salary_max", e.target.value)}
                  placeholder="Ej: 1800000"
                  min="0"
                />
              </div>

              <div className="field">
                <label>Salario (texto)</label>
                <input
                  value={form.salary_text}
                  onChange={(e) => update("salary_text", e.target.value)}
                  placeholder="Ej: Renta de mercado + bonos"
                />
              </div>

              <div className="field">
                <label>Área</label>
                <input
                  value={form.area}
                  onChange={(e) => update("area", e.target.value)}
                  placeholder="Ej: Desarrollo / Datos"
                />
              </div>

              <div className="field">
                <label>Rol</label>
                <input
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  placeholder="Ej: Backend Developer"
                />
              </div>

              <div className="field span-2">
                <label>Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Resumen de responsabilidades y requisitos…"
                />
              </div>

              {/* Beneficios (tags simples) */}
              <div className="field span-2">
                <label>Beneficios (click para alternar)</label>
                <div className="benefits-chipset">
                  {["Seguro de salud", "Bono movilización", "Teletrabajo", "Día libre cumpleaños", "Capacitaciones"]
                    .map((b) => (
                      <button
                        type="button"
                        key={b}
                        className={`chip ${form.benefits.includes(b) ? "active" : ""}`}
                        onClick={() => toggleBenefit(b)}
                      >
                        {b}
                      </button>
                    ))
                  }
                </div>
              </div>
            </div>

            <div className="actions">
              <button className="btn-primary" disabled={!canSubmit || busy}>
                {busy ? "Guardando…" : "Guardar oferta"}
              </button>
            </div>

            {msg && <div className={`toast ${msg.type}`}>{msg.text}</div>}
          </form>
        </div>
      </div>
    );
  }