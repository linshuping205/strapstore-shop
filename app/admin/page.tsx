"use client";

import Link from "next/link";

const stats = [
  { label: "今日订单", value: "12", change: "+20%", up: true },
  { label: "今日销售额", value: "$1,280", change: "+15%", up: true },
  { label: "总访客", value: "342", change: "-5%", up: false },
  { label: "库存预警", value: "3", change: "需补货", up: false, alert: true },
];

const modules = [
  { title: "产品管理", desc: "添加/编辑商品、库存管理", href: "/admin/products", icon: "📦", color: "bg-blue-50 text-blue-600" },
  { title: "订单管理", desc: "查看订单、处理发货、退款", href: "/admin/orders", icon: "📋", color: "bg-green-50 text-green-600" },
  { title: "用户管理", desc: "注册用户、会员信息", href: "/admin/users", icon: "👤", color: "bg-purple-50 text-purple-600" },
  { title: "博客内容", desc: "Journal文章、SEO内容发布", href: "/admin/content", icon: "📝", color: "bg-orange-50 text-orange-600" },
  { title: "用户评价", desc: "商品评价审核、回复管理", href: "/admin/reviews", icon: "⭐", color: "bg-yellow-50 text-yellow-600" },
  { title: "优惠券", desc: "创建折扣码、满减活动", href: "/admin/coupons", icon: "🏷️", color: "bg-pink-50 text-pink-600" },
  { title: "运费设置", desc: "国家/地区运费、包邮规则", href: "/admin/shipping", icon: "🚚", color: "bg-cyan-50 text-cyan-600" },
  { title: "SEO设置", desc: "站点地图、Meta标签", href: "/admin/seo", icon: "🔍", color: "bg-indigo-50 text-indigo-600" },
];

const recentOrders = [
  { id: "#ORD-001", customer: "John Smith", product: "Leather Strap - Brown", amount: "$49.00", status: "已发货", date: "2024-06-23" },
  { id: "#ORD-002", customer: "Emma Wilson", product: "Rubber Sport Strap", amount: "$35.00", status: "待处理", date: "2024-06-23" },
  { id: "#ORD-003", customer: "Michael Chen", product: "Metal Bracelet", amount: "$89.00", status: "已完成", date: "2024-06-22" },
  { id: "#ORD-004", customer: "Sarah Johnson", product: "Nato Strap - Navy", amount: "$28.00", status: "已发货", date: "2024-06-22" },
  { id: "#ORD-005", customer: "David Lee", product: "Leather Strap - Black", amount: "$49.00", status: "待处理", date: "2024-06-21" },
];

const topProducts = [
  { name: "Leather Strap - Brown", sold: 45, stock: 120, revenue: "$2,205" },
  { name: "Metal Bracelet - Silver", sold: 32, stock: 85, revenue: "$2,848" },
  { name: "Rubber Sport Strap", sold: 28, stock: 15, revenue: "$980" },
  { name: "Nato Strap - Navy", sold: 24, stock: 200, revenue: "$672" },
];

const lowStock = [
  { name: "Rubber Sport Strap - Black", stock: 15, sku: "RUB-001" },
  { name: "Metal Bracelet - Gold", stock: 8, sku: "MET-002" },
  { name: "Leather Strap - Vintage", stock: 5, sku: "LET-003" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "已发货": "bg-blue-100 text-blue-700",
    "待处理": "bg-yellow-100 text-yellow-700",
    "已完成": "bg-green-100 text-green-700",
    "已取消": "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.alert ? "bg-red-100 text-red-600" : stat.up ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 功能模块 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">功能模块</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod, i) => (
            <Link key={i} href={mod.href} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition group">
              <div className={`w-10 h-10 rounded-lg ${mod.color} flex items-center justify-center text-xl mb-3`}>{mod.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700">{mod.title}</h3>
              <p className="text-sm text-gray-500">{mod.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 最近订单 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">最近订单</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700">查看全部</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">订单号</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">客户</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">金额</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">状态</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{order.customer}</div>
                      <div className="text-xs text-gray-400">{order.product}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右侧 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">库存预警</h2>
              <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">{lowStock.length}个</span>
            </div>
            <div className="divide-y divide-gray-100">
              {lowStock.map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.sku}</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">{item.stock} 件</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <Link href="/admin/products" className="text-sm text-blue-600 font-medium">去补货 →</Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
            <div className="space-y-2">
              <Link href="/admin/content/new" className="block w-full text-center py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">+ 写新博客</Link>
              <Link href="/admin/reviews" className="block w-full text-center py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">查看待审核评价</Link>
              <Link href="/admin/products/new" className="block w-full text-center py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">添加新产品</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
