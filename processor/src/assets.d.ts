// Wrangler "Data" rule modules — PNGs import as ArrayBuffer.
declare module "*.png" {
  const data: ArrayBuffer;
  export default data;
}
