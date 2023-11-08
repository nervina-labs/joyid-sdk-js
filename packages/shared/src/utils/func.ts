export const safeExec = <T>(fn: () => T): T | null => {
  try {
    return fn()
  } catch (error) {
    //
    return null
  }
}
