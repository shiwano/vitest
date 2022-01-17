import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'pathe';

const isWindows = process.platform === "win32";
function slash(str) {
  return str.replace(/\\/g, "/");
}
function normalizeId(id, base) {
  if (base && id.startsWith(base))
    id = `/${id.slice(base.length)}`;
  return id.replace(/^\/@id\/__x00__/, "\0").replace(/^\/@id\//, "").replace(/^__vite-browser-external:/, "").replace(/^node:/, "").replace(/[?&]v=\w+/, "?").replace(/\?$/, "");
}
function isPrimitive(v) {
  return v !== Object(v);
}
function toFilePath(id, root) {
  let absolute = slash(id).startsWith("/@fs/") ? id.slice(4) : id.startsWith(dirname(root)) ? id : id.startsWith("/") ? slash(resolve(root, id.slice(1))) : id;
  if (absolute.startsWith("//"))
    absolute = absolute.slice(1);
  return isWindows && absolute.startsWith("/") ? fileURLToPath(pathToFileURL(absolute.slice(1)).href) : absolute;
}

export { isPrimitive, isWindows, normalizeId, slash, toFilePath };
