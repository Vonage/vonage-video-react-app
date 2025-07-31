/**
 * Formatte une date ISO en heure française (ex: "17h20")
 * @param dateString - une date ISO (ex: "2025-07-30T07:21:00.000Z")
 * @returns string formatée (ex: "09h21")
 */
export function getTimeStringFromDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Utilise le fuseau local de l'utilisateur
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}h${minutes}`;
}
