import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/admin/products/" className="p-8 bg-white border border-gray-200 rounded-xl hover:border-accent transition-colors">
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <p className="text-gray-500">Manage inventory and listings</p>
        </Link>
        <Link href="/admin/orders/" className="p-8 bg-white border border-gray-200 rounded-xl hover:border-accent transition-colors">
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <p className="text-gray-500">View and process orders</p>
        </Link>
      </div>
    </div>
  );
}
