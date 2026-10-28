/**
 * Utilities for template substitution and multi-tier clipboard handling
 */

export interface CopyResult {
  success: boolean;
  needsManualDialog?: boolean;
  copiedText: string;
}

/**
 * Replaces placeholders like {{PROJECT_NAME}} with corresponding field value.
 * If value is missing or empty, replaces with "[fill: KEY]".
 */
export function substituteVariables(
  template: string,
  fields: Record<string, string>
): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = fields[key]?.trim();
    if (val && val.length > 0) {
      return val;
    }
    return `[fill: ${key}]`;
  });
}

/**
 * Multi-tier copy strategy:
 * 1. navigator.clipboard.writeText
 * 2. Hidden textarea with document.execCommand("copy")
 * 3. Fallback flag indicating caller should show manual copy dialog
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  // 1. Try modern clipboard API
  if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, copiedText: text };
    } catch {
      // Fall through to fallback
    }
  }

  // 2. Try legacy execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      return { success: true, copiedText: text };
    }
  } catch {
    // Fall through to manual dialog
  }

  // 3. Fallback requiring manual copy dialog
  return { success: false, needsManualDialog: true, copiedText: text };
}
