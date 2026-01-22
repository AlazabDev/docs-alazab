export function safeName(input: string) {
  const cleaned = String(input || '')
    .replace(/[/\\]/g, '_')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[<>:"|?*]/g, '_')
    .trim()

  return cleaned.length ? cleaned : 'file'
}
