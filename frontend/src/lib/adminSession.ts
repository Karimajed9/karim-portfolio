/** Headers for admin calls. Cookie auth still uses credentials: 'include'. */
export function adminAuthHeaders(
  csrfToken: string | null,
  sessionToken: string | null,
  extra?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = { ...extra }
  if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken
  if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`
  return headers
}

/**
 * Read the live form fields. iOS password managers fill the DOM without
 * firing React onChange, and the username keyboard can add surrounding space.
 * Password is left unchanged so a real password that includes spaces still matches.
 */
export function readAdminLoginFields(form: HTMLFormElement): { username: string; password: string } {
  const data = new FormData(form)
  return {
    username: String(data.get('username') ?? '').trim(),
    password: String(data.get('password') ?? ''),
  }
}
