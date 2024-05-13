export function wrapText(text: string, offset: number) {
  return text
    .replaceAll('\\n', '\n')
    .replace(
      new RegExp(`(?![^\\n]{1,${offset.toString()}}$)([^\\n]{1,${offset.toString()}})\\s`, 'g'),
      '$1\n',
    )
}
