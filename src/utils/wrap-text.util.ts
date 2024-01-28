export function wrapText(text: string, offset: number) {
  return text
    .replaceAll('\\n', '\n')
    .replace(new RegExp(`(?![^\\n]{1,${offset}}$)([^\\n]{1,${offset}})\\s`, 'g'), '$1\n')
}
