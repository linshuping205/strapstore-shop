const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'orders@masterstrap.com';

async function sendEmail(to: string, subject: string, text: string) {
  if (!resendApiKey) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `MasterStrap <${fromEmail}>`,
        to,
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('Resend error:', data);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('Failed to send email:', err?.message || err);
    return false;
  }
}

export async function sendOrderConfirmation(to: string, orderId: string, total: number, items: { name: string; quantity: number; price: number }[]) {
  if (!resendApiKey) {
    console.log(`[Email skipped] Order confirmation to ${to} (no RESEND_API_KEY)`);
    return;
  }
  const itemList = items.map(i => `• ${i.name} x${i.quantity} - $${Number(i.price).toFixed(2)}`).join('\n');
  const subject = `Order Confirmation - #${orderId.slice(0, 8)}`;
  const text = `Thank you for your order!\n\nOrder ID: ${orderId}\nTotal: $${total.toFixed(2)}\n\nItems:\n${itemList}\n\nWe'll notify you once your order ships.\n\n- MasterStrap Team`;
  const ok = await sendEmail(to, subject, text);
  if (ok) console.log('Order confirmation sent to', to);
}

export async function sendShippingNotification(to: string, orderId: string, total: number, trackingNumber?: string) {
  if (!resendApiKey) {
    console.log(`[Email skipped] Shipping notification to ${to} (no RESEND_API_KEY)`);
    return;
  }
  const tracking = trackingNumber ? `\nTracking Number: ${trackingNumber}` : '';
  const subject = `Your Order Has Shipped - #${orderId.slice(0, 8)}`;
  const text = `Great news! Your order has been shipped.\n\nOrder ID: ${orderId}\nTotal: $${total.toFixed(2)}${tracking}\n\nYou can track your order status in your account dashboard.\n\n- MasterStrap Team`;
  const ok = await sendEmail(to, subject, text);
  if (ok) console.log('Shipping notification sent to', to);
}
