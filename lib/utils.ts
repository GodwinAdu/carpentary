import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Generates a secure numeric verification code.
 * @param length - The number of digits (default: 6)
 * @returns A numeric string code like "482931"
 */
export function generateCode(length = 6): string {
  const digits = '0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[array[i] % 10]; // Ensure it's 0–9
  }

  return code;
}


/**
 * Generate a clean username from full name
 * @param fullName - e.g. "John Doe"
 * @returns A string like "john_doe_2384"
 */
export function generateUsernameFromName(fullName: string): string {
  const cleaned = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')      // remove non-letters
    .split(/\s+/)                  // split by space
    .slice(0, 2)                   // use first and last name (max 2 parts)
    .join('_');

  const suffix = Math.floor(1000 + Math.random() * 9000); // 4-digit

  return `${cleaned}_${suffix}`;
}



export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}