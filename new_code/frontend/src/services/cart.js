// Simple localStorage-backed cart helper
export function getCart() {
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCart(items) {
  localStorage.setItem('cart', JSON.stringify(items));
  window.dispatchEvent(new Event('cartUpdate'));
}

export function addToCart(item) {
  const items = getCart();
  const existing = items.find(i => i.id === item.id && i.menuId === item.menuId);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
  } else {
    items.push({ ...item, quantity: item.quantity || 1 });
  }
  saveCart(items);
}

export function clearCart() {
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdate'));
}
