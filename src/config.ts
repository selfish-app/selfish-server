import { dirname, fromFileUrl } from "path/mod.ts";
export const ROOT: string = dirname(fromFileUrl(import.meta.url));