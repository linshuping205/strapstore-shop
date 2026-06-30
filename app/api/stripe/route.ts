import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });

    const { items, email, name, address, city, country, postalCode, couponCode, discount } = await req.json();

    const originalTotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const discountAmount = discount || 0;
    const finalTotal = Math.max(0, originalTotal - discountAmount);

    // Proportionally distribute discount across items
    let adjustedItems = items;
    if (discountAmount > 0 && originalTotal > 0) {
      const ratio = finalTotal / originalTotal;
      adjustedItems = items.map((item: any) => ({
        ...item,
        price: Math.round(item.price * ratio * 100) / 100,
      }));
      // Fix rounding: adjust last item to match exact final total
      const adjustedTotal = adjustedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
      const diff = finalTotal - adjustedTotal;
      if (Math.abs(diff) > 0.001 && adjustedItems.length > 0) {
        const last = adjustedItems[adjustedItems.length - 1];
        last.price = Math.round((last.price + diff / last.quantity) * 100) / 100;
      }
    }

    const lineItems = adjustedItems.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel/`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU'],
      },
      metadata: {
        items: JSON.stringify(
          items.map((i: any) => ({
            id: i.id,
            quantity: i.quantity,
            price: i.price,
          }))
        ),
        email: email || '',
        name: name || '',
        address: address || '',
        city: city || '',
        country: country || '',
        postalCode: postalCode || '',
        couponCode: couponCode || '',
        discount: String(discountAmount),
        originalTotal: String(originalTotal),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment failed' },
      { status: 500 }
    );
  }
}
