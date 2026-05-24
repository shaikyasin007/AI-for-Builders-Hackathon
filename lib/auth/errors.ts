export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return (
      'Cannot reach Supabase. Keep Email auth enabled (Providers → Email → ON). ' +
      'Only turn off "Confirm email", not the whole Email provider.'
    )
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String((error as { message: string }).message)
    if (msg.includes('signup') || msg.includes('Signups not allowed')) {
      return 'New signups are disabled in Supabase. Use the demo login on /login instead.'
    }
    return msg
  }

  return 'Something went wrong. Please try again.'
}
