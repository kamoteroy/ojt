export function capitalizeString(str) {
  return (str || "").replace(/\b\w/g, (char) => char.toUpperCase());
}
