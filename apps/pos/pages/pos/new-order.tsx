'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  preparationTime: number;
}

interface OrderItem {
  menuItemId: string;
  quantity: number;
  item?: MenuItem;
}

export default function NewOrder() {
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    if (!token) {
      router.push('/pos/login');
      return;
    }

    fetchMenuData();
  }, [token, router]);

  const fetchMenuData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/menu/categories`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/menu/items`),
      ]);

      setMenuCategories(categoriesRes.data);
      setMenuItems(itemsRes.data);
      if (categoriesRes.data.length > 0) {
        setSelectedCategory(categoriesRes.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    }
  };

  const filteredItems = selectedCategory
    ? menuItems.filter((item: any) => item.categoryId === selectedCategory)
    : menuItems;

  const addItem = (item: MenuItem) => {
    const existing = orderItems.find((oi) => oi.menuItemId === item.id);
    if (existing) {
      existing.quantity += 1;
      setOrderItems([...orderItems]);
    } else {
      setOrderItems([
        ...orderItems,
        { menuItemId: item.id, quantity: 1, item },
      ]);
    }
  };

  const removeItem = (menuItemId: string) => {
    setOrderItems(orderItems.filter((oi) => oi.menuItemId !== menuItemId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, oi) => {
      const item = menuItems.find((mi: any) => mi.id === oi.menuItemId);
      return total + (item?.price || 0) * oi.quantity;
    }, 0);
  };

  const submitOrder = async () => {
    if (!tableNumber || orderItems.length === 0) {
      alert('Please select a table and add items');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          tableNumber: parseInt(tableNumber),
          items: orderItems,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      router.push('/pos/dashboard');
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
          <button
            onClick={() => router.push('/pos/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Menu */}
          <div className="col-span-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Menu</h2>

              {/* Category Filter */}
              <div className="mb-6 flex gap-2">
                {menuCategories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-lg px-4 py-2 font-semibold ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-2 gap-4">
                {filteredItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => addItem(item)}
                      className="mt-2 w-full rounded-lg bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Order</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Table Number
              </label>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="mb-4 space-y-2 border-b border-gray-200 pb-4">
              {orderItems.map((oi) => {
                const item = menuItems.find((mi: any) => mi.id === oi.menuItemId);
                return (
                  <div key={oi.menuItemId} className="flex justify-between text-sm">
                    <span>
                      {item?.name} x{oi.quantity}
                    </span>
                    <div className="flex gap-2">
                      <span>${((item?.price || 0) * oi.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeItem(oi.menuItemId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-4">
              <p className="text-lg font-bold text-gray-900">
                Total: ${calculateTotal().toFixed(2)}
              </p>
            </div>

            <button
              onClick={submitOrder}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Order'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
