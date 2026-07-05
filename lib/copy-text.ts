// Shared clipboard helper — returns true when the value was copied.
export async function copyTextToClipboard(value: string): Promise<boolean> {
  if (!value.trim()) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
