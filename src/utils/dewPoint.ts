export function calculateDewPoint(temperature: number, humidity: number): number {
  return Number((temperature - (100 - humidity) / 5).toFixed(1));
}
