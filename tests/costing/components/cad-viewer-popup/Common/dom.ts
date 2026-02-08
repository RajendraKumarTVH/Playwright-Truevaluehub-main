/**
 * @param theHtml HTML representing a single element
 */
export function htmlToElement(theHtml: string) {
  const aTemplate = document.createElement('template');
  theHtml = theHtml.trim(); // Never return a text node of whitespace as the result
  aTemplate.innerHTML = theHtml;
  return aTemplate.content.firstChild as HTMLElement;
}
