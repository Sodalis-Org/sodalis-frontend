export function getPrivateRedirect({ user }) {
  if (!user) return '/onboarding'
  if (!user.coloc_id) return '/onboarding/coloc'
  return null
}
