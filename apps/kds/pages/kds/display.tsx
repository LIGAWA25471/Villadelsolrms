'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function KDSDisplay() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const branchId = typeof window !== 'undefined' ? localStorage.getItem('branchId') : null;

  useEffect(() => {
    if (!token) {
      router.push('/kds/login');
      return;
    }

    fetchQueue();
    setupWebSocket();
  }, [token, router]);

  const fetchQueue = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/kitchen/queue`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setQueue(response.data);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: { token },
    });

    socket.emit('subscribe-kitchen', { branchId });

    socket.on('order-created', (order) => {
      fetchQueue();
    });

    socket.on('queue-updated', (queueItem) => {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === queueItem.id ? queueItem : q,
        ),
      );
    });

    return () => socket.disconnect();
  };

  const updateQueueStatus = async (queueId: string, status: string) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/kitchen/queue/${queueId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchQueue();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-red-50 border-red-300';
      case 'ACCEPTED':
        return 'bg-yellow-50 border-yellow-300';
      case 'PREPARING':
        return 'bg-blue-50 border-blue-300';
      case 'READY_FOR_PICKUP':
        return 'bg-green-50 border-green-300';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-black shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Kitchen Display System</h1>
          <button
            onClick={() => {
              localStorage.clear();
              router.push('/kds/login');
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="text-center text-white">Loading kitchen queue...</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {['NEW', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].map((status) => (
              <div key={status} className="rounded-lg bg-gray-800 p-4">
                <h2 className="mb-4 text-lg font-bold text-white">{status.replace('_', ' ')}</h2>
                <div className="space-y-3">
                  {queue
                    .filter((item: any) => item.status === status)
                    .map((item: any) => (
                      <div
                        key={item.id}
                        className={`rounded-lg border-2 p-4 ${getStatusColor(item.status)}`}
                      >
                        <p className="font-bold text-gray-900">
                          Order #{item.order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-700">
                          Table {item.order.tableNumber || 'TBD'}
                        </p>

                        <div className="my-3 border-t border-gray-300 pt-2">
                          {item.order.items.map((oi: any) => (
                            <p key={oi.id} className="text-sm text-gray-900">
                              {oi.quantity}x {oi.menuItem.name}
                            </p>
                          ))}
                        </div>

                        <div className="mt-3 flex gap-2">
                          {status === 'NEW' && (
                            <button
                              onClick={() => updateQueueStatus(item.id, 'ACCEPTED')}
                              className="flex-1 rounded bg-yellow-600 px-2 py-1 text-white hover:bg-yellow-700"
                            >
                              Accept
                            </button>
                          )}
                          {status === 'ACCEPTED' && (
                            <button
                              onClick={() => updateQueueStatus(item.id, 'PREPARING')}
                              className="flex-1 rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
                            >
                              Start
                            </button>
                          )}
                          {status === 'PREPARING' && (
                            <button
                              onClick={() => updateQueueStatus(item.id, 'READY_FOR_PICKUP')}
                              className="flex-1 rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700"
                            >
                              Ready
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
