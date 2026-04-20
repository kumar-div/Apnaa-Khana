/**
 * Shared utility functions used across the application.
 * Extracted to eliminate duplication between my-orders, admin/orders, and email.
 */

/**
 * Formats a date string into a human-readable relative time or short date.
 */
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Safely parses an order's items field (stored as JSON string or array).
 */
export function parseItems(items: any): any[] {
  if (!items) return [];
  try {
    const parsed = typeof items === "string" ? JSON.parse(items) : items;
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}
