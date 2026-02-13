'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: { name: string };
}

export default function QRMenu() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [tableNumber, setTableNumber] = useState(
    new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get(
      'table',
    ) || '',
  );

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/menu/categories`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/menu/items`),
      ]);

      setCategories(categoriesRes.data);
      setMenuItems(itemsRes.data);
      if (categoriesRes.data.length > 0) {
        setSelectedCategory(categoriesRes.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    }
  };

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.categoryId === selectedCategory)
    : menuItems;

  const addToCart = (item: MenuItem) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        ),
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.id !== itemId));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const submitOrder = async () => {
    if (!tableNumber || cart.length === 0) {
      alert('Please enter table number and select items');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          tableNumber: parseInt(tableNumber),
          items: cart.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
        },
      );

      alert('Order placed successfully!');
      setCart([]);
      setTableNumber('');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Villa del Sol</h1>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Order ({cart.length})
          </button>
        </div>
      </header>

      <main className="p-4">
        {/* Table Input */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <label className="block text-sm font-medium text-gray-700">
            Table Number
          </label>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2"
            placeholder="Enter your table number"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Menu */}
          <div className="lg:col-span-3">
            {/* Categories */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 rounded-full px-4 py-2 font-semibold ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {filteredItems.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-white p-4 shadow hover:shadow-lg transition-shadow"
                >
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                  <p className="mt-2 text-lg font-bold text-blue-600">
                    ${item.price.toFixed(2)}
                  </p>
                  <button
                    onClick={() => addToCart(item)}
                    className="mt-3 w-full rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                  >
                    Add to Order
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          {showCart && (
            <div className="rounded-lg bg-white p-4 shadow lg:col-span-1">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Your Order</h2>

              <div className="mb-4 space-y-2 border-b border-gray-200 pb-4">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500">No items selected</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <div className="flex gap-2">
                        <span className="font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <>
                  <p className="mb-4 text-lg font-bold text-gray-900">
                    Total: ${getTotal().toFixed(2)}
                  </p>
                  <button
                    onClick={submitOrder}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                  >
                    Place Order
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
