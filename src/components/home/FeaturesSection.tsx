'use client';

export default function FeaturesSection() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-black mb-6">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-black mb-2">QR Ordering</h3>
            <p className="text-black">Scan QR codes to place orders</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-black mb-2">Deliveroo Integration</h3>
            <p className="text-black">Manage external delivery orders</p>
          </div>
        </div>
      </div>
    </section>
  );
} 