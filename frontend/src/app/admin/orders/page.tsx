"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Phone,
  Eye,
  Download,
  Filter,
  Plus,
  X,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { Order } from "@/context/LibraryCartContext";
import { sanitizeCsvCell } from "@/lib/security";

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, addMockOrder } = useAdmin();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Pending" && order.status !== "Completed") ||
      (selectedStatus === "Completed" && order.status === "Completed");

    return matchesSearch && matchesStatus;
  });

  const exportOrdersCSV = () => {
    const headers = "Order Number,Customer Name,Email,Phone,Total (£),Status,Created At\n";
    const rows = filteredOrders
      .map((o) =>
        [
          sanitizeCsvCell(o.orderNumber),
          sanitizeCsvCell(o.customer.fullName),
          sanitizeCsvCell(o.customer.email),
          sanitizeCsvCell(o.customer.phone || ""),
          sanitizeCsvCell(o.total),
          sanitizeCsvCell(o.status),
          sanitizeCsvCell(o.createdAt),
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `storyhour-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F0F0F] tracking-tight">
              Orders & Fulfillment
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              {filteredOrders.length} orders
            </span>
          </div>
          <p className="text-[#6B655C] text-xs sm:text-sm mt-1">
            Track customer checkouts, dispatch physical editions, and manage billing records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportOrdersCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F3] text-[#0F0F0F] text-xs font-semibold border border-[#E8E4DC] transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#6B655C]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() =>
              addMockOrder({
                customer: {
                  fullName: "Radhika Iyer",
                  email: "radhika.iyer@gmail.com",
                  phone: "+44 7922 881002",
                },
                total: 54.98,
                items: [
                  {
                    id: "edition-ram",
                    title: "Ramayana Deluxe Box Set",
                    format: "Clothbound Foil Edition",
                    price: 34.99,
                    quantity: 1,
                    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
                    type: "book",
                  },
                ],
              })
            }
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9281D] hover:bg-[#A82017] text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Order</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # (e.g. SH-2026-9812), customer name, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] placeholder-[#8C827A] focus:outline-none focus:border-[#C9281D]"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full md:w-52 px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-xs text-[#0F0F0F] focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending Fulfillment</option>
          <option value="Completed">Completed / Dispatched</option>
        </select>
      </div>

      {/* 3. Orders Table */}
      <div className="rounded-2xl bg-white border border-[#E8E4DC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E8E4DC] bg-[#FAF8F3] text-[10px] font-mono uppercase text-[#6B655C]">
                <th className="py-3.5 px-4 font-semibold">Order #</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Line Items</th>
                <th className="py-3.5 px-4 font-semibold">Payment</th>
                <th className="py-3.5 px-4 font-semibold">Total Amount</th>
                <th className="py-3.5 px-4 font-semibold">Fulfillment</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DC] text-[#0F0F0F]">
              {filteredOrders.map((order) => (
                <tr key={order.orderId} className="hover:bg-[#FAF8F3]/60 transition group">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0F0F0F]">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#8C827A] text-[11px]">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#0F0F0F]">{order.customer.fullName}</div>
                    <div className="text-[10px] text-[#8C827A] font-mono">{order.customer.email}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="line-clamp-1 text-[#0F0F0F]">
                      {order.items.map((i) => i.title).join(", ")}
                    </div>
                    <div className="text-[10px] text-[#8C827A]">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#6B655C]">
                    {order.paymentMethod || "Stripe"}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                    £{order.total?.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border focus:outline-none ${
                        order.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      <option value="Confirmed (Test Mode)">
                        Pending Dispatch
                      </option>
                      <option value="Completed">
                        Dispatched
                      </option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setViewingOrder(order)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] hover:bg-[#F4EFE6] border border-[#E8E4DC] text-[#0F0F0F] inline-flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#6B655C]" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-16 text-center text-[#8C827A] text-xs">
            No orders match the search criteria.
          </div>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingOrder(null)} />
          <div className="relative w-full max-w-xl rounded-2xl bg-white border border-[#E8E4DC] shadow-2xl p-6 z-10 text-[#0F0F0F]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DC]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#0F0F0F]">
                  Order Details — {viewingOrder.orderNumber}
                </h3>
                <span className="text-[11px] text-[#8C827A] font-mono">
                  Placed on {new Date(viewingOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1 rounded-lg hover:bg-[#FAF8F3] text-[#8C827A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Customer Details */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] space-y-1.5">
                <div className="font-semibold text-[#0F0F0F] flex items-center gap-2">
                  <span>Customer & Shipping Information</span>
                </div>
                <div className="text-[#0F0F0F] font-medium">{viewingOrder.customer.fullName}</div>
                <div className="text-[#6B655C] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#8C827A]" />
                  <span>{viewingOrder.customer.email}</span>
                </div>
                {viewingOrder.customer.phone && (
                  <div className="text-[#6B655C] flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#8C827A]" />
                    <span>{viewingOrder.customer.phone}</span>
                  </div>
                )}
                {viewingOrder.billing && (
                  <div className="text-[#6B655C] flex items-start gap-2 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8C827A] mt-0.5 flex-shrink-0" />
                    <span>
                      {viewingOrder.billing.address}, {viewingOrder.billing.city},{" "}
                      {viewingOrder.billing.postalCode}, {viewingOrder.billing.country}
                    </span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="font-semibold text-[#0F0F0F]">Ordered Items</div>
                {viewingOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 rounded bg-white border border-[#E8E4DC] overflow-hidden flex-shrink-0">
                        {item.coverImage && (
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[#0F0F0F] text-xs">{item.title}</div>
                        <div className="text-[10px] text-[#8C827A]">{item.format}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-[#0F0F0F] font-bold">£{(item.price * item.quantity).toFixed(2)}</div>
                      <div className="text-[10px] text-[#8C827A]">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between font-mono text-xs">
                <span className="text-emerald-900 font-sans font-medium">Total Charged ({viewingOrder.paymentMethod}):</span>
                <span className="text-lg font-bold text-emerald-800">
                  £{viewingOrder.total?.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#FAF8F3] hover:bg-[#F4EFE6] border border-[#E8E4DC] text-xs font-semibold text-[#0F0F0F]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  updateOrderStatus(
                    viewingOrder.orderId,
                    viewingOrder.status === "Completed" ? "Confirmed (Test Mode)" : "Completed"
                  );
                  setViewingOrder((prev) =>
                    prev
                      ? {
                          ...prev,
                          status:
                            prev.status === "Completed" ? ("Confirmed (Test Mode)" as any) : "Completed",
                        }
                      : null
                  );
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold text-white shadow-sm"
              >
                {viewingOrder.status === "Completed" ? "Mark as Pending" : "Confirm Dispatch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
