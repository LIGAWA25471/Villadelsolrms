'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function POSDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    if (!token) {
      router.push('/pos/login');
      return;
    }

    fetchOrders();
    setupWebSocket();
  }, [token, router]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: { token },
    });

    socket.on('order-created', (order) => {
      setOrders((prev) => [order, ...prev]);
    });

    socket.on('order-status-updated', (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === data.orderId ? { ...o, status: data.status } : o,
        ),
      );
    });

    return () => socket.disconnect();
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/pos/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">POS Dashboard</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => router.push('/pos/new-order')}
            className="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
          >
            Create New Order
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading orders...</div>
        ) : (
          <div className="grid gap-6">
            {orders.length === 0 ? (
              <p className="text-center text-gray-500">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          Table {order.tableNumber || 'TBD'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${order.totalAmount}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            order.status === 'COMPLETED'
                              ? 'text-green-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {order.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
