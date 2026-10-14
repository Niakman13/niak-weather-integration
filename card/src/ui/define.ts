/**
 * `@customElement` that leaves an element already defined alone. While a card from HACS is still installed
 * next to the integration's, both load on the same page: the first one defines the elements, the second changes nothing.
 */
export const define = (tag: string) => (element: CustomElementConstructor): void => {
  if (!customElements.get(tag)) customElements.define(tag, element);
};
