"use client";
import Image from "next/image";

export default function Footer() {
  const scrollTo = (id: string) => {
    if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 dark:bg-gray-950 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8">
          
          {/* Brand Section & About */}
          <div className="space-y-4 lg:col-span-1">
            <button onClick={() => scrollTo('home')} className="flex items-center gap-3 mb-6 group">
              <Image 
                src="/images/food-hero.jpg" 
                alt="Apnaa Khana Logo" 
                width={36} 
                height={36} 
                className="rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Apnaa <span className="text-brand-500">Khana</span>
              </span>
            </button>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Ghar jaisa taste, delivered with care.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
              Fresh, homemade meals prepared daily with quality ingredients. We serve home-style food made with love, perfect for daily meals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <button onClick={() => scrollTo('home')} className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-sm font-medium">Home</button>
              </li>
              <li>
                <button onClick={() => scrollTo('menu')} className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-sm font-medium">Menu</button>
              </li>
              <li>
                <button onClick={() => scrollTo('contact')} className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-sm font-medium">Contact</button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Locate Us</h3>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-start gap-3">
                <span className="shrink-0 text-brand-500">📍</span>
                <span className="leading-relaxed">B 1300, Block B, Mayur Vihar Phase 3, Kondli, Near Malik Nursing Home Hospital, New Delhi 110096</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="shrink-0 text-brand-500">📞</span>
                <a href="tel:+917303598548" className="hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">+91 73035 98548</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="shrink-0 text-brand-500">🕐</span>
                <span>10:00 AM – 9:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Socials & Why Us */}
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Why Choose Us</h3>
            <ul className="space-y-3 mb-8 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <li className="flex items-center gap-2"><span className="text-brand-500">✓</span> Fresh Daily</li>
              <li className="flex items-center gap-2"><span className="text-brand-500">✓</span> Homemade Taste</li>
              <li className="flex items-center gap-2"><span className="text-brand-500">✓</span> Affordable Pricing</li>
            </ul>
            
            <div className="flex gap-4">
              <a href="https://instagram.com/kumar__divyansh" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-500 text-gray-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://wa.me/917303598548" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-[#25D366] text-gray-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </a>
            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            © {new Date().getFullYear()} Apnaa Khana. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
