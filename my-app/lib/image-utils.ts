/**
 * Validates whether a string is a valid image source for Next.js <Image /> or <img>.
 * Must be a relative path starting with '/', an absolute http/https URL, or a base64 data:image URL.
 * Returns the cleaned URL string if valid, otherwise returns null.
 */
export function toValidImageSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/") ||
    /^https?:\/\//i.test(trimmed)
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return null;
}
