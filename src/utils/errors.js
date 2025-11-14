export function extractErrors(json) {
  if (!json) return "Error desconocido";

  if (json.error) return json.error;
  if (json.detail) return json.detail;
  if (json.non_field_errors) return json.non_field_errors.join(", ");

  if (typeof json === "object") {
    return Object.entries(json)
      .map(([k, v]) =>
        `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
      )
      .join("\n");
  }

  return JSON.stringify(json);
}
export function extractErrors(json) {
  if (!json) return "Error desconocido.";

  if (typeof json === "string") return json;
  if (json.error) return json.error;
  if (json.detail) return json.detail;
  if (json.non_field_errors?.length) return json.non_field_errors.join(" ");

  const mensajes = [];

  for (const key in json) {
    const val = json[key];

    if (Array.isArray(val)) {
      mensajes.push(`${key}: ${val.join(", ")}`);
    } else if (typeof val === "string") {
      mensajes.push(`${key}: ${val}`);
    }
  }

  return mensajes.length ? mensajes.join(" | ") : "Error inesperado.";
}