export function replaceContent(content: string, ...replacements: [string | RegExp, string][]): string {
  let res = content
  replacements.forEach(([from, to]) => {
    res = res.replace(from as any, to)
  })
  return res
}
