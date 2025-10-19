import { clsx, type ClassValue } from "clsx";
import { twMerge } from "flowbite-react/helpers/tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
