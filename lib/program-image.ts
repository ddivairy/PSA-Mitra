export function isAllowedProgramImage(value: unknown, partnerId: string) {
  if (typeof value !== 'string' || value.length > 1000) return false;
  if (value.startsWith('/images/') && !value.includes('..')) return true;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return false;
  try {
    const imageUrl = new URL(value);
    const supabaseUrl = new URL(baseUrl);
    const expectedPath = `${supabaseUrl.pathname.replace(/\/$/, '')}/storage/v1/object/public/program-media/${partnerId}/`;
    return imageUrl.origin === supabaseUrl.origin && imageUrl.pathname.startsWith(expectedPath);
  } catch {
    return false;
  }
}
