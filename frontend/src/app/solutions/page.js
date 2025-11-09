'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import contentData from '@/content/solutions/content.js';
import { ChevronRight, ChevronDown } from 'lucide-react';

export default function SolutionsIndex() {
  const [expanded, setExpanded] = useState({}); // track which subcategory is expanded

  // helper for toggling expand
  const toggle = (cat, sub) => {
    setExpanded(prev => {
      const key = `${cat}||${sub}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold">Our Solutions</h1>
          <p className="mt-2">Explore product families and click a product to view details.</p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto p-6">
        {Object.keys(contentData).map((category) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{category.replace(/-/g, ' ')}</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {Object.keys(contentData[category]).map((subcategory) => (
                <div key={subcategory} className="bg-white p-4 rounded shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{subcategory.replace(/-/g, ' ')}</h3>
                    <button onClick={() => toggle(category, subcategory)} className="text-gray-500">
                      {expanded[`${category}||${subcategory}`] ? <ChevronDown /> : <ChevronRight />}
                    </button>
                  </div>

                  {expanded[`${category}||${subcategory}`] && (
                    <ul className="mt-3 ml-3 space-y-2">
                      {Object.keys(contentData[category][subcategory]).map((productId) => {
                        const product = contentData[category][subcategory][productId];
                        const href = `/solutions/${category}/${subcategory}/${productId}`;
                        return (
                          <li key={productId} className="flex items-start">
                            <div className="flex-1">
                              <Link href={href} className="text-blue-600 hover:underline">
                                {product.title || productId}
                              </Link>
                              <div className="text-sm text-gray-600">{product.description}</div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}