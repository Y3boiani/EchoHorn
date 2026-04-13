'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, Reservation, Stats } from '@/lib/api';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, reservationsData] = await Promise.all([
        api.getStats(),
        api.getReservations(filter === 'all' ? undefined : filter)
      ]);
      setStats(statsData);
      setReservations(reservationsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdating(true);
      await api.updateReservation(id, { status: newStatus });
      await fetchData();
      if (selectedReservation?.id === id) {
        const updated = await api.getReservation(id);
        setSelectedReservation(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;
    
    try {
      await api.deleteReservation(id);
      await fetchData();
      if (selectedReservation?.id === id) {
        setSelectedReservation(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete reservation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'contacted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md">
          <h2 className="text-red-400 text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`${orbitron.className} text-4xl md:text-5xl font-bold text-yellow-400 mb-2`}>
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Manage trial bookings and reservations</p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="text-gray-400 text-sm mb-2">Total Bookings</div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6">
              <div className="text-yellow-400 text-sm mb-2">Pending</div>
              <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
            </div>
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
              <div className="text-blue-400 text-sm mb-2">Contacted</div>
              <div className="text-3xl font-bold text-blue-400">{stats.contacted}</div>
            </div>
            <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
              <div className="text-green-400 text-sm mb-2">Completed</div>
              <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
            </div>
          </motion.div>
        )}

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6 flex-wrap"
        >
          {['all', 'pending', 'contacted', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Reservations Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Fleet Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No reservations found
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation, index) => (
                    <motion.tr
                      key={reservation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-t border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedReservation(reservation)}
                          className="text-white hover:text-yellow-400 transition-colors font-medium"
                        >
                          {reservation.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{reservation.company}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-300">{reservation.email}</div>
                          <div className="text-gray-500">{reservation.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{reservation.fleetSize || '-'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={reservation.status}
                          onChange={(e) => handleStatusUpdate(reservation.id, e.target.value)}
                          disabled={updating}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(reservation.status)} bg-transparent cursor-pointer`}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(reservation.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(reservation.id)}
                          className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Reservation Detail Modal */}
      <AnimatePresence>
        {selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReservation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className={`${orbitron.className} text-2xl font-bold text-yellow-400`}>
                  Reservation Details
                </h2>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Booking ID</label>
                  <div className="text-white font-mono text-sm">{selectedReservation.id}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Name</label>
                  <div className="text-white font-semibold text-lg">{selectedReservation.name}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Company</label>
                  <div className="text-white">{selectedReservation.company}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <a href={`mailto:${selectedReservation.email}`} className="text-yellow-400 hover:underline block">
                      {selectedReservation.email}
                    </a>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Phone</label>
                    <a href={`tel:${selectedReservation.phone}`} className="text-yellow-400 hover:underline block">
                      {selectedReservation.phone}
                    </a>
                  </div>
                </div>
                {selectedReservation.fleetSize && (
                  <div>
                    <label className="text-gray-400 text-sm">Fleet Size</label>
                    <div className="text-white">{selectedReservation.fleetSize}</div>
                  </div>
                )}
                {selectedReservation.message && (
                  <div>
                    <label className="text-gray-400 text-sm">Message</label>
                    <div className="text-white bg-white/5 p-4 rounded-lg">{selectedReservation.message}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Status</label>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedReservation.status)}`}>
                      {selectedReservation.status}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Created At</label>
                    <div className="text-white text-sm">{formatDate(selectedReservation.createdAt)}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
