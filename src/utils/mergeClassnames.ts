import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const mergeClassnames = (...args: ClassValue[]) => {
  return twMerge(clsx(args));
};
