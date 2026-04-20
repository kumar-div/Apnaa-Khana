"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import Image from "next/image";
import type { MenuItem, MenuCategory } from "@/data/menu";

export default function AdminDashboard() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { showToast } = useToast();

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<MenuCategory>("mains");
  const [image, setImage] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (isAdmin) fetchMenu();
  }, [isAdmin]);

  const fetchMenu = async () => {
     const { data } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false });
     if (data) setItems(data);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image too large. Max 5MB allowed.", "error");
        return;
      }
      
      setIsUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      // Generate a clean predictable filename based on the current timestamp
      const fileName = `menu-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Generate public URL
      const { data } = supabase.storage.from('menu-images').getPublicUrl(fileName);
      
      setImage(data.publicUrl);
      showToast("Image uploaded successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Error uploading image", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!name || !price) return;

     const payload = {
        name,
        price: Number(price),
        category,
        image: image || '/images/food/default.png',
        is_popular: isPopular,
     };

     if (editingId) {
       const { error } = await supabase.from('menu_items').update(payload).eq('id', editingId);
       if (error) { showToast('Failed to update item', 'error'); return; }
       showToast('Item updated!', 'success');
     } else {
       const { error } = await supabase.from('menu_items').insert([payload]);
       if (error) { showToast('Failed to create item', 'error'); return; }
       showToast('Item published!', 'success');
     }

     resetForm();
     fetchMenu();
  };

  const deleteItem = async (id: string) => {
     setIsDeleting(id);
     const { error } = await supabase.from('menu_items').delete().eq('id', id);
     if (error) {
       showToast('Failed to delete item', 'error');
     } else {
       showToast('Item deleted', 'info');
       fetchMenu();
     }
     setIsDeleting(null);
  };

  const startEdit = (item: MenuItem) => {
     if (!item.id) return;
     setEditingId(item.id);
     setName(item.name);
     setPrice(String(item.price));
     setCategory(item.category as MenuCategory || "mains");
     setImage(item.image || "");
     setIsPopular(item.is_popular || item.popular || false);
  };

  const resetForm = () => {
     setEditingId(null);
     setName("");
     setPrice("");
     setImage("");
     setIsPopular(false);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <span className="text-6xl mb-4">🔐</span>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 text-center max-w-sm">
          You need admin privileges to access this page. Please sign in with an admin account.
        </p>
        <Link href="/" className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 pt-24 sm:p-12 sm:pt-28 relative overflow-hidden transition-colors">
       <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 w-full bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
             <div>
               <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Menu Manager</h1>
               <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Signed in as {user.email}</p>
             </div>
             <div className="flex items-center gap-3">
               <Link href="/admin/orders" className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">
                 📦 Orders Dashboard
               </Link>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* LEFT COLUMN: FORM */}
             <div className="lg:col-span-1 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm h-fit">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                  {editingId ? "Edit Menu Item" : "Create New Item"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Item Name</label>
                    <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-brand-500 focus:border-brand-500 dark:text-gray-100" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Price (₹)</label>
                      <input type="number" value={price} onChange={(e)=>setPrice(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-brand-500 focus:border-brand-500 dark:text-gray-100" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Category</label>
                      <select value={category} onChange={(e)=>setCategory(e.target.value as MenuCategory)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-brand-500 focus:border-brand-500 dark:text-gray-100">
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="mains">Mains</option>
                        <option value="specials">Specials</option>
                        <option value="snacks">Snacks</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Item Image</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                       {/* Preview Box */}
                       <div className="w-20 h-20 shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex items-center justify-center relative">
                          {isUploadingImage ? (
                            <span className="animate-spin text-xl">⏳</span>
                          ) : image ? (
                            <Image src={image} alt="Preview" fill sizes="80px" className="object-cover" />
                          ) : (
                            <span className="text-gray-400 text-2xl">🍽️</span>
                          )}
                       </div>
                       
                       {/* Upload Input */}
                       <div className="flex-1 w-full">
                         <div className="relative">
                           <input 
                             type="file" 
                             accept="image/*"
                             onChange={handleImageUpload}
                             disabled={isUploadingImage}
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                           />
                           <div className={`px-4 py-3 rounded-lg border-2 border-dashed ${isUploadingImage ? 'border-gray-300 bg-gray-50' : 'border-brand-300 bg-brand-50 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/20'} flex items-center justify-center gap-2 transition-colors`}>
                             <span className="text-xl">{isUploadingImage ? '⌛' : '📸'}</span>
                             <span className={`text-sm font-bold ${isUploadingImage ? 'text-gray-500' : 'text-brand-700 dark:text-brand-400'}`}>
                               {isUploadingImage ? "Uploading to Cloud..." : image ? "Change Image" : "Upload Menu Image"}
                             </span>
                           </div>
                         </div>
                         <p className="text-[10px] text-gray-400 mt-1.5 font-medium ml-1">PNG, JPG, WEBP up to 5MB.</p>
                       </div>
                    </div>
                    {/* Hidden input to keep it in state payload without rendering a ugly url box */}
                    <input type="hidden" value={image} />
                  </div>
                  
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Popular / Featured Item?</label>
                    <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="w-5 h-5 accent-brand-500 cursor-pointer" />
                  </div>

                  <div className="flex gap-3 pt-4">
                     <button type="submit" className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all shadow-md">{editingId ? "Update Item" : "Publish Item"}</button>
                     {editingId && <button type="button" onClick={resetForm} className="px-5 font-bold bg-gray-200 dark:bg-gray-800 dark:text-white rounded-xl">Cancel</button>}
                  </div>
                </form>
             </div>

             {/* RIGHT COLUMN: LIST */}
             <div className="lg:col-span-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm min-h-[500px]">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center justify-between">
                  Live Menu
                  <span className="text-sm font-bold text-white bg-brand-500 px-3 py-1 rounded-full">{items.length} items</span>
                </h3>

                {items.length === 0 ? (
                  <div className="py-20 text-center text-gray-500">No items available. Create one to start.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {items.map(item => (
                       <div key={item.id} className="relative group border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-4 min-w-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                            ) : (
                              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                              <div className="flex items-center gap-2 mt-0.5 max-w-full">
                                <span className="text-brand-600 font-bold block shrink-0">₹{item.price}</span>
                                <span className="text-xs uppercase font-extrabold text-gray-400 bg-gray-200 dark:bg-gray-800 dark:text-gray-500 px-1.5 py-0.5 rounded truncate">{item.category}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                             <button onClick={() => startEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md">Edit</button>
                             <button onClick={() => item.id && deleteItem(item.id)} disabled={isDeleting === item.id} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md disabled:opacity-50 transition-opacity">{isDeleting === item.id ? '...' : 'Del'}</button>
                          </div>
                          
                          {item.is_popular && (
                             <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">POPULAR</div>
                          )}
                       </div>
                     ))}
                  </div>
                )}
             </div>

          </div>
       </div>
    </div>
  );
}
