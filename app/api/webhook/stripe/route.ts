import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (!metadata) {
      return NextResponse.json({ received: true });
    }

    const items = JSON.parse(metadata.items || '[]');
    const email = metadata.email || session.customer_details?.email || 'unknown@example.com';
    const name = metadata.name || session.customer_details?.name || 'Guest';
    const address = metadata.address || '';
    const city = metadata.city || '';
    const country = metadata.country || '';
    const postalCode = metadata.postalCode || '';
    const total = (session.amount_total || 0) / 100;
    const couponCode = metadata.couponCode || '';
    const discount = metadata.discount ? parseFloat(metadata.discount) : 0;

    try {
      let orderId = '';
      await prisma.$transaction(async (tx) => {
        // Create order
        const orderData: any = {
          email,
          name,
          address,
          city,
          country,
          postalCode,
          total,
          status: 'PAID',
          stripeSessionId: session.id,
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        };
        if (couponCode) {
          orderData.couponCode = couponCode;
          orderData.discount = discount;
        }
        const order = await tx.order.create({ data: orderData });
        orderId = order.id;

        // Deduct inventory
        for (const item of items) {
          await tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Increment coupon usage count
        if (couponCode) {
          try {
            await tx.coupon.updateMany({
              where: { code: couponCode },
              data: { usedCount: { increment: 1 } },
            });
          } catch { /* coupon table may not exist */ }
        }
      });

      console.log('Order created from Stripe webhook:', session.id, 'Order ID:', orderId);

      // Send order confirmation email
      await sendOrderConfirmation(email, orderId, total, items.map((i: any) => ({
        name: i.name || 'Product',
        quantity: i.quantity,
        price: i.price,
      })));

    } catch (err: any) {
      console.error('Failed to create order from webhook:', err);
    }
  }

  return NextResponse.json({ received: true });
}
