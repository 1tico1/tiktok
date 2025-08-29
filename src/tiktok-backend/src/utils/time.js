// util p/ ISO com offset -03:00 (America/Sao_Paulo)
export function toISOWithBR(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  const y = date.getFullYear(), m = pad(date.getMonth()+1), d = pad(date.getDate());
  const hh = pad(date.getHours()), mm = pad(date.getMinutes()), ss = pad(date.getSeconds());
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}-03:00`;
}