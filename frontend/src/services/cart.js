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

export function updateCartItemQuantity(itemId, quantity) {
  const items = getCart();
  const index = items.findIndex(i => i.id === itemId);
  if (index !== -1) {
    if (quantity <= 0) {
      items.splice(index, 1);
    } else {
      items[index].quantity = quantity;
    }
    saveCart(items);
  }
}

export function removeCartItem(itemId) {
  const items = getCart();
  const updatedItems = items.filter(i => i.id !== itemId);
  saveCart(updatedItems);
}
