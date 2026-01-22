export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  // Only enforce when server requires a key and public read is disabled
  try {
    const me = await $fetch('/api/auth/me') as any
    if (me?.hasKey && !me?.publicRead && !me?.authenticated) {
      return navigateTo('/login')
    }
  } catch {
    // If auth check fails, be conservative and redirect
    return navigateTo('/login')
  }
})
