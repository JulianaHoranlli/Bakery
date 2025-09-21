"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Navbar from "./components/Navbar";
import DatePicker from "react-datepicker";
import { FiEdit3 } from "react-icons/fi";
import "react-datepicker/dist/react-datepicker.css";

type Item = {
  product: string;
  quantity: number;
  price: number;
};

export default function AddOrder() {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pickup, setPickup] = useState(false);
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [sideNote, setSideNote] = useState(""); 
  const [items, setItems] = useState<Item[]>([{ product: "", quantity: 1, price: 0 }]);

  const addItem = () => setItems([...items, { product: "", quantity: 1, price: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof Item, value: string | number) => {
    setItems(prev => {
      const newItems = [...prev];
      if (field === "quantity" || field === "price") {
        newItems[index] = { ...newItems[index], [field]: Number(value) };
      } else {
        newItems[index] = { ...newItems[index], [field]: value as string };
      }
      return newItems;
    });
  };

  const submitOrder = async () => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        customer, 
        phone, 
        address, 
        pickup, 
        pickupTime: pickupTime?.toISOString() || null,
        sideNote, 
        items 
      }),
    });

    if (res.ok) {
      toast.success("Order added successfully!");
      setCustomer(""); setPhone(""); setAddress(""); setPickup(false);
      setSideNote(""); setItems([{ product: "", quantity: 1, price: 0 }]);
      setPickupTime(null);
    } else {
      const err = await res.json();
      toast.error(`Failed to add order: ${err?.error || res.statusText}`);
    }
  };

  const addOrder = async () => {
    if (!customer || !phone || items.some(i => !i.product || i.quantity <= 0 || i.price <= 0)) {
      toast.error("Please fill in all required fields and valid product info!");
      return;
    }

    const regex = /^06\d{8}$/;
    if (!regex.test(phone)) {
      toast.error("Phone should start with 06 and have 10 digits.");
      return;
    }

    await submitOrder();
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-pink-100 p-4 pt-20">
      <div className="w-full max-w-2xl bg-pink-300 p-8 rounded-xl shadow-xl sm:p-10">
        <Navbar />
        <h1 className="text-4xl font-bold mb-6 text-center text-white">🍰 Add Order</h1>

        <div className="flex flex-col gap-8 mb-6">
          <input 
            value={customer} 
            onChange={e => setCustomer(e.target.value)} 
            placeholder="Customer" 
            className="border-2 border-white bg-pink-200/40 p-3 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition" 
          />
          <input 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            placeholder="Phone" 
            className="border-2 border-white bg-pink-200/40 p-3 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition" 
          />
          <input 
            value={address} 
            onChange={e => setAddress(e.target.value)} 
            placeholder="Address (optional)" 
            className="border-2 border-white bg-pink-200/40 p-3 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition" 
          />

          <label className="flex items-center gap-2 text-lg text-white">
            <input type="checkbox" checked={pickup} onChange={e => setPickup(e.target.checked)} />
            <b>Pickup</b>
          </label>

          <div>
            <label className="block mb-1 text-white">Pickup Time:</label>
            <DatePicker
              selected={pickupTime}
              onChange={(date) => setPickupTime(date)}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              className="border-2 border-white bg-pink-200/40 p-2 rounded w-full text-white placeholder-white/70 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition"
              placeholderText="Select pickup time"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 mb-1 text-white">
              <FiEdit3 className="text-pink-50" />
              Side Note:
            </label>
            <textarea
              value={sideNote}
              onChange={e => setSideNote(e.target.value)}
              placeholder="Write a note (optional)"
              className="border-2 border-white bg-pink-200/40 p-3 rounded-lg w-full text-white placeholder-white/70 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition"
              rows={3}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Products</h2>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="relative border border-white rounded-lg p-4 text-lg bg-pink-200/30">
                {/* Remove button */}
                {index > 0 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1.5 rounded-lg text-base shadow-md hover:bg-red-600"
                    title="Remove product"
                  >
                    ×
                  </button>
                )}

                <div className="flex items-start gap-4">
                  {/* Product */}
                  <div className="flex-1 flex flex-col">
                    <label className="mb-1 text-sm text-white/90">Product</label>
                    <input
                      value={item.product}
                      onChange={e => updateItem(index, "product", e.target.value)}
                      placeholder="Product"
                      className="border-2 border-white bg-transparent rounded-lg p-3 text-lg text-white placeholder-white/70 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="flex flex-col w-28">
                    <label className="mb-1 text-sm text-white/90 text-center">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItem(index, "quantity", e.target.value)}
                      placeholder="Qty"
                      className="border-2 border-white bg-transparent rounded-lg p-3 text-lg text-center text-white placeholder-white/70 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition"
                    />
                  </div>

                  {/* Price */}
                  <div className="flex flex-col w-32">
                    <label className="mb-1 text-sm text-white/90 text-center">Price</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={e => updateItem(index, "price", e.target.value)}
                      placeholder="Price"
                      className="border-2 border-white bg-transparent rounded-lg p-3 text-lg text-center text-white placeholder-white/70 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addItem}
            className="bg-white text-pink-500 px-4 py-2 rounded-lg mt-3 w-full text-lg font-medium hover:bg-pink-50 transition"
          >
            + Add Product
          </button>
        </div>

        <button onClick={addOrder} className="bg-pink-400 text-white px-6 py-3 rounded-lg font-semibold w-full hover:bg-pink-50 transition">Add Order</button>
      </div>
    </main>
  );
}
