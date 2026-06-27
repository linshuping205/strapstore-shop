# Strapstore Shop 全面代码审查报告

## 项目概况
- **项目**: Strapstore Shop - 手表表带电商系统
- **技术栈**: Next.js 14.2 + Prisma 5.13 + PostgreSQL + Vercel + Stripe
- **代码量**: 约 40+ 文件，覆盖前台商城、后台管理、博客、支付系统

---

## 一、安全漏洞 (Critical / High)

### 1. SQL 注入风险 (Critical) - app/api/seed/route.ts

**问题**: 使用 `prisma.$executeRawUnsafe` 拼接 SQL 字符串，虽然做了转义但不够安全。

```typescript
// 有风险的代码
const escapedValues = values.map((v: string) => v.replace(/'/g, "''"));
const sql = `INSERT INTO "Product" (id, name, ...) VALUES ...`;
await prisma.$executeRawUnsafe(sql);
```

**风险**: 单引号转义不完全（Unicode 引号、转义序列等可能被绕过）。

**修复建议**: 使用 Prisma 的参数化查询或 `createMany`。

---

### 2. Webhook 签名验证缺失 (Critical) - app/api/webhook/stripe/route.ts

**问题**: 没有验证 Stripe webhook 签名，任何人都可以伪造 webhook 请求来创建订单。

```typescript
// 有风险的代码
const body = await request.text();
const event = JSON.parse(body); // 没有验证签名！
if (event.type === 'checkout.session.completed') {
  await prisma.order.create(...);
}
```

**风险**: 攻击者可伪造 Stripe 支付成功请求，免费创建订单。

**修复建议**:
```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
```

---

### 3. 订单创建无输入校验 (High) - app/api/orders/route.ts

**问题**: POST 直接解构 body 创建订单，无字段校验。

```typescript
// 有风险的代码
export async function POST(request: NextRequest) {
  const body = await request.json();
  const order = await prisma.order.create({
    data: { ...body }  // 直接展开，无校验！
  });
}
```

**风险**: 可注入任意字段，可能覆盖 total、status 等敏感字段。

---

### 4. 产品创建无输入校验 (High) - app/api/products/route.ts

**问题**: 类似订单，POST 直接解构创建产品，无字段校验和权限检查。

---

### 5. XSS 漏洞 (High) - app/(main)/blog/[slug]/page.tsx

**问题**: 直接使用 `dangerouslySetInnerHTML` 渲染用户输入的博客内容。

```tsx
// 有风险的代码
<div dangerouslySetInnerHTML={{ __html: post.content }} />
```

**风险**: 管理员在富文本编辑器中写入的恶意脚本会被执行，或如果编辑器被绕过，攻击者可直接注入 XSS。

**修复建议**: 使用 DOMPurify 或 SSR 安全的 HTML sanitizer。

---

### 6. 文件上传无校验 (Medium) - app/api/upload/route.ts

**问题**: 无文件类型校验、无文件大小限制（服务端）、无认证保护。

```typescript
// 有问题的代码
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') || `${Date.now()}.bin`;
  const blob = await request.blob();  // 无大小限制！
  // 任何人都可以上传！
}
```

**风险**: 可上传恶意文件、超大文件耗尽存储。

---

### 7. 无限制的点赞/浏览量刷取 (Medium) - app/api/posts/[id]/like|view

**问题**: 点赞和浏览量无防刷机制，用户可无限刷数据。

```typescript
// 有问题的代码
export async function POST() {
  await prisma.post.update({ data: { likes: { increment: 1 } } });
}
```

**修复建议**: 使用 IP 限制或 localStorage 限制（客户端）+ session 限制（服务端）。

---

### 8. 评论无内容过滤 (Medium) - app/api/posts/[id]/comments/route.ts

**问题**: 评论内容无长度限制、无 XSS 过滤，直接存入数据库并展示。

```typescript
// 有问题的代码
const { name, email, content } = body;
await prisma.comment.create({ data: { name, email, content } }); // 无过滤！
```

**修复建议**: 添加内容长度限制、XSS 过滤、邮箱格式验证。

---

### 9. 管理员认证逻辑缺陷 (Medium) - middleware.ts

**问题**: ADMIN_PASSWORD 为空时逻辑允许访问。

```typescript
// 有问题的代码
const adminPassword = process.env.ADMIN_PASSWORD || '';
const expected = 'Basic ' + toBase64('admin:' + adminPassword);
if (!adminPassword || auth !== expected) {  // !adminPassword 时直接通过！
  return new NextResponse('Authentication required', { status: 401 });
}
```

**实际行为**: 如果 ADMIN_PASSWORD 未设置，条件 !adminPassword 为 true，返回 401 - 这是正确的。但如果设置了空字符串，也是 401。逻辑本身不算严重漏洞，但写法容易误解。

**建议**: 明确检查 !adminPassword 时返回配置错误信息。

---

### 10. Seed 接口无保护 (Medium) - app/api/seed/route.ts

**问题**: 任何人都可以触发 seed 路由重新初始化数据库。

```typescript
// 有风险的代码
export async function GET() {  // 任何人可访问！
  await prisma.$executeRawUnsafe(`DELETE FROM ...`);
}
```

**风险**: 公开环境可被恶意清空数据。

**修复建议**: 添加环境变量检查（仅开发环境可用）或管理员认证。

---

## 二、架构/设计问题 (Major)

### 11. 首页硬编码数据与数据库不同步 (Major) - app/(main)/page.tsx

**问题**: 首页"Featured Products"和"New Arrivals"区域是静态硬编码的 HTML，不是从数据库读取的真实产品。

```tsx
// 静态硬编码的示例
<div className="product-grid">
  <div className="product-card">...静态内容...</div>
  ...
</div>
```

**影响**: 添加新产品不会自动显示在首页，必须手动修改代码。

**修复建议**: 从数据库读取 isActive 产品，按分类或排序展示。

---

### 12. 后台 Dashboard 假数据 (Major) - app/admin/page.tsx

**问题**: "Recent Orders" 表格是硬编码的 5 条假数据，非真实订单。

```tsx
// 硬编码的示例
const recentOrders = [
  { id: 'ORD-001', customer: 'John Smith', email: 'john@example.com', ... },
  ... // 5 条假数据
];
```

**影响**: 管理员无法看到真实订单数据。

**修复建议**: 从 /api/orders 获取真实订单。

---

### 13. Footer 硬编码信息 (Minor) - components/Footer.tsx

**问题**: 硬编码了 "Florence, Italy" 和 Instagram/Pinterest 社交媒体链接。

---

### 14. 缺失搜索功能 (Minor)

**问题**: API 有 search 参数支持，但前台没有搜索 UI。

---

## 三、性能问题 (Medium)

### 15. Sitemap 无分页 (Medium) - app/sitemap.ts

**问题**: 一次性加载所有产品和博客文章，数据量大时可能超时或超出 Vercel 限制。

```typescript
// 有问题的代码
const products = await prisma.product.findMany({ ... }); // 无 limit！
const posts = await prisma.post.findMany({ ... }); // 无 limit！
```

**修复建议**: 添加 take: 5000 限制或使用流式处理。

---

### 16. 无 API 缓存 (Medium)

**问题**: 产品列表、博客列表等 API 无缓存，每次请求都查数据库。

**修复建议**: 对不频繁变化的数据使用 Next.js revalidate 或 Redis 缓存。

---

### 17. 无数据库连接优化 (Low)

**问题**: Prisma 连接池未配置，高并发可能耗尽连接。

---

## 四、代码质量问题 (Minor)

### 18. 类型安全不足

多处使用 any 类型：
- app/(main)/checkout/success/page.tsx: const [order, setOrder] = useState<any>(null);
- 多个 API 路由错误处理为 any

### 19. 重复代码

- 多处相同的 formatDate 函数（ProductGrid.tsx、PostComments.tsx、BlogsPage.tsx 等）
- 多处相同的 slug 生成逻辑
- 建议提取到 lib/utils.ts

### 20. 缺少错误边界

- 没有全局错误边界组件
- API 错误只打印 console，没有统一处理

### 21. Prisma 客户端初始化注释与代码不符 - lib/prisma.ts

```typescript
// 注释写"延迟初始化"，但实际是同步初始化
const prismaClientSingleton = () => {
  return new PrismaClient({ log: ['error'] });
};
```

---

## 五、修复优先级建议

| 优先级 | 问题 | 文件 |
|--------|------|------|
| Critical | SQL 注入 | app/api/seed/route.ts |
| Critical | Stripe Webhook 无签名验证 | app/api/webhook/stripe/route.ts |
| Critical | 订单创建无校验 | app/api/orders/route.ts |
| Critical | 产品创建无校验 | app/api/products/route.ts |
| Critical | XSS 漏洞 | app/(main)/blog/[slug]/page.tsx |
| High | 文件上传无校验 | app/api/upload/route.ts |
| High | Seed 接口无保护 | app/api/seed/route.ts |
| High | 点赞/浏览无防刷 | app/api/posts/[id]/like view |
| High | 评论无过滤 | app/api/posts/[id]/comments |
| Medium | 首页硬编码数据 | app/(main)/page.tsx |
| Medium | Dashboard 假数据 | app/admin/page.tsx |
| Medium | Sitemap 无分页 | app/sitemap.ts |
| Low | 重复代码 | 多处 |
| Low | 类型安全 | 多处 |

---

## 六、修复代码示例

### 修复 Webhook 签名验证
```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    // ... process order
  }
}
```

### 修复订单输入校验
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // 字段校验
  const { email, name, address, city, country, postalCode, total, items } = body;
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (!name || name.trim().length < 2) return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  if (!items || !Array.isArray(items) || items.length === 0) return NextResponse.json({ error: 'No items' }, { status: 400 });
  if (!total || total <= 0) return NextResponse.json({ error: 'Invalid total' }, { status: 400 });
  
  // 只提取需要的字段，不直接展开
  const order = await prisma.order.create({
    data: {
      email: email.trim(),
      name: name.trim(),
      address: address?.trim(),
      city: city?.trim(),
      country: country?.trim(),
      postalCode: postalCode?.trim(),
      total: Number(total),
      status: 'pending', // 强制默认值
      items: { create: items.map(...) }
    }
  });
  return NextResponse.json(order);
}
```

### 修复 XSS（博客内容）
```tsx
import DOMPurify from 'isomorphic-dompurify';

// 在服务端渲染时净化
const cleanContent = DOMPurify.sanitize(post.content, {
  ALLOWED_TAGS: ['p', 'br', 'h1', 'h2', 'h3', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title']
});

<div dangerouslySetInnerHTML={{ __html: cleanContent }} />
```

### 修复文件上传
```typescript
export async function POST(request: NextRequest) {
  // 检查认证（需要管理员权限）
  const auth = request.headers.get('authorization');
  // ... 验证 auth
  
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  if (!filename) return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
  
  const blob = await request.blob();
  
  // 校验文件大小
  if (blob.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 413 });
  }
  
  // 校验文件类型
  if (!blob.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
  }
  
  // 安全文件名
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  const { url } = await put(safeName, blob, { access: 'public' });
  return NextResponse.json({ url });
}
```

---

## 七、总结

该项目整体架构良好，但存在以下主要问题：

1. **安全方面**: 最严重的是 SQL 注入、Webhook 签名缺失、XSS 漏洞和输入校验不足。这些问题可能导致数据泄露、恶意攻击或免费订单。

2. **功能方面**: 首页硬编码数据、Dashboard 假数据导致前后台数据不同步，影响用户体验。

3. **性能方面**: 缺少缓存和分页，数据量大时会出问题。

4. **代码质量**: 重复代码较多，缺少统一的错误处理和工具函数。

建议优先修复所有 Critical 和 High 级别的问题，然后再处理 Medium 和 Low 级别的问题。
