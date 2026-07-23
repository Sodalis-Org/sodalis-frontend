export function getPrivateRedirect({ token, user }) {
  if (!token) return '/onboarding'
  if (!user?.coloc_id) return '/onboarding/coloc'
  return null
}
