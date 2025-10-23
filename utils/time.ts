const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export function formatDistanceToNow(date: Date): string {
  const seconds = Math.round((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 30) return "justo ahora";
  if (seconds < MINUTE) return `hace ${seconds} segundos`;
  if (seconds < HOUR) return `hace ${Math.floor(seconds / MINUTE)} minutos`;
  if (seconds < DAY) return `hace ${Math.floor(seconds / HOUR)} horas`;
  if (seconds < WEEK) return `hace ${Math.floor(seconds / DAY)} días`;
  if (seconds < MONTH) return `hace ${Math.floor(seconds / MONTH)} meses`;
  return `hace ${Math.floor(seconds / YEAR)} años`;
}