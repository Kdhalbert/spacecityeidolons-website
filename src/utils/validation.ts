/**
 * Shared Validation Utilities
 * Used by both frontend and backend for consistent validation logic
 * Keep in sync with api/src/utils/validation.ts
 */

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const PATTERNS = {
  // Email validation
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // URL validation
  url: /^https?:\/\/.+/,
  
  // Twitch URL validation
  twitchUrl: /^(https?:\/\/)?(www\.)?twitch\.tv\/[a-zA-Z0-9_]+\/?$/,
  
  // Username/displayName (alphanumeric, spaces, dashes, underscores)
  displayName: /^[a-zA-Z0-9\s\-_']{2,100}$/,
  
  // Slug (lowercase alphanumeric with dashes)
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  
  // UUID v4
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Password strength check
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[^A-Za-z0-9]/,
} as const;

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

export interface PasswordStrength {
  score: number; // 0-4
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  checks: {
    length: boolean; // At least 8 characters
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: PATTERNS.hasUppercase.test(password),
    lowercase: PATTERNS.hasLowercase.test(password),
    number: PATTERNS.hasNumber.test(password),
    special: PATTERNS.hasSpecial.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const score = Math.min(4, passedChecks - 1); // 0-4

  const levels: Array<'weak' | 'fair' | 'good' | 'strong' | 'very-strong'> = [
    'weak',
    'fair',
    'good',
    'strong',
    'very-strong',
  ];

  const feedback: string[] = [];
  if (!checks.length) feedback.push('At least 8 characters');
  if (!checks.uppercase) feedback.push('An uppercase letter');
  if (!checks.lowercase) feedback.push('A lowercase letter');
  if (!checks.number) feedback.push('A number');
  if (!checks.special) feedback.push('A special character');

  return {
    score,
    level: levels[score],
    checks,
    feedback: feedback.length > 0 
      ? [`Password needs: ${feedback.join(', ')}`]
      : ['Strong password'],
  };
}

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

export function isValidEmail(email: string): boolean {
  return PATTERNS.email.test(email);
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// ============================================================================
// URL VALIDATION
// ============================================================================

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidTwitchUrl(url: string): boolean {
  if (!url) return true; // Optional field
  return PATTERNS.twitchUrl.test(url);
}

// ============================================================================
// SLUG VALIDATION & GENERATION
// ============================================================================

export function isValidSlug(slug: string): boolean {
  return PATTERNS.slug.test(slug);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Remove multiple dashes
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

// ============================================================================
// DISPLAY NAME VALIDATION
// ============================================================================

export function isValidDisplayName(name: string): boolean {
  return PATTERNS.displayName.test(name);
}

// ============================================================================
// UUID VALIDATION
// ============================================================================

export function isValidUuid(id: string): boolean {
  return PATTERNS.uuid.test(id);
}

// ============================================================================
// TEXT VALIDATION
// ============================================================================

export function sanitizeText(text: string, maxLength: number = 500): string {
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/\s+/g, ' '); // Normalize whitespace
}

export function isValidBio(bio: string): boolean {
  return bio.length <= 500;
}

// ============================================================================
// ARRAY VALIDATION
// ============================================================================

export function validateArray<T>(
  arr: unknown,
  validator: (item: unknown) => item is T,
  options?: {
    minLength?: number;
    maxLength?: number;
  }
): arr is T[] {
  if (!Array.isArray(arr)) return false;
  
  if (options?.minLength && arr.length < options.minLength) return false;
  if (options?.maxLength && arr.length > options.maxLength) return false;
  
  return arr.every(item => validator(item));
}

export function isStringArray(arr: unknown): arr is string[] {
  return validateArray(arr, (item): item is string => typeof item === 'string');
}

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

export function isInteger(value: unknown): boolean {
  return Number.isInteger(value);
}

export function isPositive(value: unknown): boolean {
  return typeof value === 'number' && value > 0;
}

export function isNonNegative(value: unknown): boolean {
  return typeof value === 'number' && value >= 0;
}

export function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// ============================================================================
// FORM VALIDATION HELPERS
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationErrors {
  private errors: Map<string, string[]> = new Map();

  add(field: string, message: string): void {
    if (!this.errors.has(field)) {
      this.errors.set(field, []);
    }
    this.errors.get(field)!.push(message);
  }

  get(field: string): string[] {
    return this.errors.get(field) || [];
  }

  getFirst(field: string): string | undefined {
    return this.get(field)[0];
  }

  has(field: string): boolean {
    return this.errors.has(field) && this.get(field).length > 0;
  }

  isEmpty(): boolean {
    return this.errors.size === 0;
  }

  toArray(): ValidationError[] {
    const result: ValidationError[] = [];
    for (const [field, messages] of this.errors) {
      for (const message of messages) {
        result.push({ field, message });
      }
    }
    return result;
  }

  toObject(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [field, messages] of this.errors) {
      result[field] = messages[0]; // Just first message per field
    }
    return result;
  }

  clear(): void {
    this.errors.clear();
  }
}

// ============================================================================
// DATE VALIDATION
// ============================================================================

export function isValidDate(date: unknown): boolean {
  if (!(date instanceof Date)) return false;
  return !isNaN(date.getTime());
}

export function isFutureDate(date: Date): boolean {
  return date.getTime() > Date.now();
}

export function isPastDate(date: Date): boolean {
  return date.getTime() < Date.now();
}

export function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  
  return { hours, minutes };
}
