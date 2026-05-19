export function slugifyTransform(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')  // replace spaces & symbols with -
    .replace(/^-+|-+$/g, '');     // trim leading/trailing dashes
}

export function deslugifyTransform(slug) {
  if (typeof slug !== 'string') return '';
  
  return slug
    .replace(/-/g, ' ')                  // Replace hyphens with spaces
    .replace(/\s+/g, ' ')                // Remove extra spaces
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize first letter of each word
}

export function toTitleCase(str) {
  if (!str) return "";

  return str
    .replace(/[_-]+/g, " ")          // Replace _ or - with space
    .toLowerCase()                   // Normalize case
    .split(" ")
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

