export function setNativeValue(element, value) {
  if (!element) return;

  let prototype = Object.getPrototypeOf(element);
  if (element.tagName === 'INPUT') {
    prototype = window.HTMLInputElement.prototype;
  } else if (element.tagName === 'SELECT') {
    prototype = window.HTMLSelectElement.prototype;
  } else if (element.tagName === 'TEXTAREA') {
    prototype = window.HTMLTextAreaElement.prototype;
  }

  const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}
