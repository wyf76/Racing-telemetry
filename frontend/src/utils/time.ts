export function formatLapTime(milliseconds: number | null, emptyLabel = "n/a") {
  if (milliseconds === null) {
    return emptyLabel;
  }

  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const ms = milliseconds % 1000;

  return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(3, "0")}`;
}
