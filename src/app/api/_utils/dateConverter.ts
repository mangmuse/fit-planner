export function convertDatesToStrings<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
