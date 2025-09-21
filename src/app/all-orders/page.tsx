"use client";

import { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaSave, FaPlus } from "react-icons/fa";
import { GiCrown } from "react-icons/gi";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";

type Item = {
  id?: number;
  product: string;
  quantity: number;
  price: number;
  total: number;
};

type Order = {
  id: number;
  customer: string;
  phone: string;
  address?: string;
  pickup: boolean;
  status: string;
  sideNote?: string;
  isHighlighted: boolean;
  items: Item[];
  createdAt?: string;
  pickupTime?: string;
};

export default function AllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (error: any) {
      console.error(error);
      toast.error("Could not load orders: " + error.message);
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete order");
      setOrders(orders.filter((o) => o.id !== id));
      toast.success("Order deleted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to delete order: " + error.message);
    }
  };

  const toggleHighlight = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/orders/${id}/highlight`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHighlighted: !current }),
      });
      if (!res.ok) throw new Error("Failed to toggle highlight");
      fetchOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to toggle highlight: " + error.message);
    }
  };

  const handleFieldChange = (
    orderId: number,
    field: keyof Order,
    value: string | boolean
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, [field]: value } : o))
    );
  };

  const handleItemChange = (
    orderId: number,
    itemIndex: number,
    field: keyof Item,
    value: string | number
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              items: o.items.map((item, i) =>
                i === itemIndex
                  ? {
                      ...item,
                      [field]: value,
                      total:
                        field === "quantity" || field === "price"
                          ? (field === "quantity"
                              ? Number(value)
                              : item.quantity) *
                            (field === "price" ? Number(value) : item.price)
                          : item.total,
                    }
                  : item
              ),
            }
          : o
      )
    );
  };

  const addItem = (orderId: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              items: [
                ...o.items,
                { product: "", quantity: 1, price: 0, total: 0 },
              ],
            }
          : o
      )
    );
  };

  const removeItem = (orderId: number, itemIndex: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, items: o.items.filter((_, i) => i !== itemIndex) }
          : o
      )
    );
  };

  const saveOrder = async (order: Order) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error("Failed to update order");
      toast.success("Order updated!");
      setEditingOrderId(null);
      fetchOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update order: " + error.message);
    }
  };

  // === Stats ===
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-pink-200 to-pink-300 pt-22 p-6">
      <div className="w-full max-w-6xl bg-white/95 p-10 rounded-3xl shadow-2xl sm:p-12">
        <Navbar />
        <h1 className="text-5xl font-extrabold mb-6 text-center text-pink-700">
          🍰 All Orders ({totalOrders})
        </h1>

        {/* Status Stats */}
        <div className="flex justify-center gap-6 mb-10 text-lg font-semibold">
          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full shadow">
            Pending: {pendingCount}
          </span>
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full shadow">
            Completed: {completedCount}
          </span>
          <span className="px-4 py-2 bg-red-100 text-red-600 rounded-full shadow">
            Cancelled: {cancelledCount}
          </span>
        </div>

        <ul className="space-y-8">
          {orders.map((o) => (
            <li
              key={o.id}
              className={`relative p-8 rounded-2xl text-lg transition-all duration-500 ease-in-out ${
                o.isHighlighted
                  ? "bg-pink-200 border-2 border-yellow-300 shadow-[0_0_30px_10px_rgba(255,215,0,0.5)] scale-[1.02]"
                  : "bg-pink-100 border border-pink-300 shadow-lg hover:shadow-2xl hover:scale-[1.01]"
              }`}
            >
              {/* Butoni Crown */}
              <button
                onClick={() => toggleHighlight(o.id, o.isHighlighted)}
                className="absolute -top-4 -left-4 text-yellow-400 hover:text-yellow-500"
              >
                <GiCrown className="w-9 h-9 drop-shadow-lg" />
              </button>

              {editingOrderId === o.id ? (
                <div className="space-y-4 text-gray-900 text-xl font-medium">
                  {/* Editing Mode */}
                  <input
                    value={o.customer}
                    onChange={(e) =>
                      handleFieldChange(o.id, "customer", e.target.value)
                    }
                    className="border-2 border-white p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none text-lg"
                    placeholder="Customer"
                  />
                  <input
                    value={o.phone}
                    onChange={(e) =>
                      handleFieldChange(o.id, "phone", e.target.value)
                    }
                    className="border-2 border-white p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none text-lg"
                    placeholder="Phone"
                  />
                  <input
                    value={o.address || ""}
                    onChange={(e) =>
                      handleFieldChange(o.id, "address", e.target.value)
                    }
                    className="border-2 border-white p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none text-lg"
                    placeholder="Address"
                  />
                  <input
                    value={o.sideNote || ""}
                    onChange={(e) =>
                      handleFieldChange(o.id, "sideNote", e.target.value)
                    }
                    placeholder="Side Note"
                    className="border-2 border-white p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none text-lg"
                  />

                  <label className="block text-lg font-semibold">
                    Pickup Time:
                    <input
                      type="datetime-local"
                      value={o.pickupTime || ""}
                      onChange={(e) =>
                        handleFieldChange(o.id, "pickupTime", e.target.value)
                      }
                      className="border-2 border-white p-3 rounded-lg w-full mt-2 focus:ring-2 focus:ring-pink-400 outline-none text-lg"
                    />
                  </label>

                  <label className="flex items-center space-x-3 text-lg">
                    <input
                      type="checkbox"
                      checked={o.pickup}
                      onChange={(e) =>
                        handleFieldChange(o.id, "pickup", e.target.checked)
                      }
                      className="h-5 w-5"
                    />
                    <span>Pickup</span>
                  </label>

                  <select
                    value={o.status}
                    onChange={(e) =>
                      handleFieldChange(o.id, "status", e.target.value)
                    }
                    className="border-2 border-white p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none text-lg"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <h4 className="font-bold text-pink-700 text-2xl mt-4">
                    Items
                  </h4>
                  {o.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-center mb-3 bg-white rounded-lg p-3 shadow-sm"
                    >
                      <input
                        value={item.product}
                        onChange={(e) =>
                          handleItemChange(o.id, i, "product", e.target.value)
                        }
                        placeholder="Product"
                        className="border-2 border-white p-3 rounded-lg flex-1 focus:ring-2 focus:ring-pink-400 outline-none text-lg"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            o.id,
                            i,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        className="border-2 border-white p-3 rounded-lg w-24 text-center focus:ring-2 focus:ring-pink-400 outline-none text-lg"
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(
                            o.id,
                            i,
                            "price",
                            Number(e.target.value)
                          )
                        }
                        className="border-2 border-white p-3 rounded-lg w-28 text-center focus:ring-2 focus:ring-pink-400 outline-none text-lg"
                      />
                      <span className="w-28 text-right font-semibold text-gray-900 text-lg">
                        ${(item.total || 0).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(o.id, i)}
                        className="text-red-500 hover:scale-110 transition-transform"
                      >
                        <FaTrash size={20} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addItem(o.id)}
                    className="flex items-center text-lg text-blue-600 mt-4 hover:underline"
                  >
                    <FaPlus className="mr-2" /> Add Item
                  </button>

                  <button
                    onClick={() => saveOrder(o)}
                    className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-3 text-lg transition"
                  >
                    <FaSave /> Save
                  </button>
                </div>
              ) : (
                <div className="text-gray-900 text-xl font-medium leading-relaxed">
                  {/* Display Mode */}
                  <div className="flex-1 text-left mb-3">
                    <strong className="text-2xl text-pink-900">
                      {o.customer}
                    </strong>{" "}
                    | {o.phone} | {o.address || "-"}
                    <br />
                    <span className="text-lg text-gray-800">
                      Pickup:{" "}
                      <span className="font-semibold">
                        {o.pickup ? "Yes" : "No"}
                      </span>{" "}
                      | Status:{" "}
                      <span
                        className={`font-semibold ${
                          o.status === "completed"
                            ? "text-green-600"
                            : o.status === "cancelled"
                            ? "text-red-500"
                            : "text-yellow-600"
                        }`}
                      >
                        {o.status}
                      </span>
                    </span>
                    {o.pickupTime && (
                      <span className="block text-lg text-gray-700 mt-2 ">
                        Pickup Time:{" "}
                        {new Date(o.pickupTime).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {o.sideNote && (
                    <div className=" mt-3 text-pink-700 bg-pink-200 rounded-md px-4 py-2">
                      Side Note: {o.sideNote}
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    {o.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-lg">
                        <span>
                          <em>{item.product}</em> x{item.quantity} @ $
                          {item.price.toFixed(2)}
                        </span>
                        <span className="font-semibold">
                          ${(item.total || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="font-bold mt-4 text-2xl text-gray-900 border-t border-gray-300 pt-3">
                    Total: $
                    {o.items
                      .reduce((sum, item) => sum + (item.total || 0), 0)
                      .toFixed(2)}
                  </div>
                </div>
              )}

              <div className="absolute top-3 right-24 text-sm text-gray-600">
                {o.createdAt
                  ? new Date(o.createdAt).toLocaleString()
                  : "No date"}
              </div>

              <div className="absolute top-3 right-3 flex gap-4">
                {editingOrderId === o.id ? null : (
                  <button
                    onClick={() => setEditingOrderId(o.id)}
                    className="text-blue-500 hover:scale-110 transition-transform"
                  >
                    <FaEdit size={22} />
                  </button>
                )}
                <button
                  onClick={() => deleteOrder(o.id)}
                  className="text-red-500 hover:scale-110 transition-transform"
                >
                  <FaTrash size={22} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
