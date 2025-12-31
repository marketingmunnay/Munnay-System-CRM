// Utilidad para formatear fecha y hora en formato "hh:mm AM/PM, DD/MM/YYYY"
// Uso: formatDateTimeAMPM(new Date() | '2025-12-23T14:30:00Z') => "02:30 PM, 23/12/2025"

export function formatDateTimeAMPM(dateInput: Date | string | number): string {
  let date: Date;
  if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }
  if (isNaN(date.getTime())) return '';

  // Obtener horas y minutos
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 => 12
  const strTime = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')} ${ampm}`;

  // Obtener día, mes, año
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${strTime}, ${day}/${month}/${year}`;
}
