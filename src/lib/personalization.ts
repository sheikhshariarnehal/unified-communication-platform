/**
 * Compiles personalization merge tags with optional default fallback values.
 * Example syntax:
 *   "Hello {{first_name | default:"Customer"}}, welcome to {{company}}!"
 */
export function compilePersonalization(
  template: string,
  context: Record<string, any>
): string {
  if (!template) return '';

  const regex = /\{\{\s*([a-zA-Z0-9_]+)(?:\s*\|\s*default\s*:\s*["']([^"']*)["'])?\s*\}\}/g;

  return template.replace(regex, (match, fieldName, defaultValue) => {
    const val = context[fieldName];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val);
    }
    return defaultValue !== undefined ? defaultValue : '';
  });
}
