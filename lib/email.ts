import { Resend } from "resend";
import type { Order } from "@/data/orders";
import { ORDER_STATUS_CONFIG } from "@/data/orders";
import { parseItems as formatItemsList } from "@/lib/utils";

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const SENDER_EMAIL = "Apnaa Khana <onboarding@resend.dev>";


export async function sendOrderConfirmationEmail(order: Order, customerEmail: string) {
  if (!resend) {
    console.warn("No RESEND_API_KEY provided, skipping order confirmation email.");
    return;
  }

  const itemsList = formatItemsList(order.items);
  const itemsHtml = itemsList.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea;">
        <span style="font-weight: 800; color: #f97316;">${item.quantity}x</span> ${item.name}
      </td>
      <td style="text-align: right; padding: 12px 0; border-bottom: 1px solid #eaeaea; font-weight: bold; color: #333;">
        ₹${item.price * item.quantity}
      </td>
    </tr>
  `).join('');

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: customerEmail,
      subject: `Order Confirmed! #${order.id.split('-')[0].toUpperCase()} - Apnaa Khana`,
      headers: {
        "Idempotency-Key": `customer-confirm-${order.id}`
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #1f2937; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0; font-size: 28px; font-weight: 900;">Apnaa Khana</h1>
            <p style="color: #6b7280; margin-top: 5px; font-weight: bold;">Ghar Jaisa Khana</p>
          </div>
          
          <div style="background-color: #fff; padding: 30px; border-radius: 16px; border: 1px solid #f3f4f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <h2 style="margin-top: 0; color: #111827; font-size: 22px;">Payment Successful! 🎉</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
              Hi ${order.customer_name},<br>
              Thank you for ordering with us. Your payment has been secured and your order is now confirmed. We've notified our kitchen.
            </p>
            
            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; font-weight: 600; font-size: 14px; color: #c2410c;">Order #${order.id.split('-')[0].toUpperCase()}</p>
              ${order.delivery_address ? `<p style="margin: 5px 0 0 0; font-size: 13px; color: #9a3412;"><strong>Delivering to:</strong> ${order.delivery_address}</p>` : ''}
              ${order.phone_number ? `<p style="margin: 5px 0 0 0; font-size: 13px; color: #9a3412;"><strong>Phone:</strong> ${order.phone_number}</p>` : ''}
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              ${itemsHtml}
              <tr>
                <td style="padding: 16px 0 0 0; font-weight: 900; font-size: 18px;">Total Paid</td>
                <td style="text-align: right; padding: 16px 0 0 0; font-weight: 900; font-size: 18px; color: #f97316;">₹${order.total_price}</td>
              </tr>
            </table>

            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/my-orders" style="display: inline-block; background-color: #f97316; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; text-align: center; width: 100%; box-sizing: border-box;">
              Track Live Order
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af;">
            <p>Need help? Reply to this email or contact us on WhatsApp.</p>
          </div>
        </div>
      `
    });
    console.log(`✉️ Order Confirmation email sent to ${customerEmail}`);
  } catch (error) {
    console.error("❌ Failed to send confirmation email via Resend:", error);
  }
}

export async function sendStatusUpdateEmail(order: Order, customerEmail: string) {
  if (!resend) return;

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  if (!statusConfig) return;

  // Don't send emails for purely background statuses if not needed, but we'll send for key ones
  if (!['preparing', 'out_for_delivery', 'delivered', 'cancelled'].includes(order.status)) return;

  const statusMessages: Record<string, string> = {
    preparing: "Your food is now being prepared in our kitchen! 👨‍🍳",
    out_for_delivery: "Your order is out for delivery and headed your way! 🛵",
    delivered: "Your order has been delivered! Enjoy your meal! 🎉",
    cancelled: "Your order has been cancelled. If this is unexpected, please contact us. ❌",
  };

  const mainMessage = statusMessages[order.status] || `Your order status has been updated to: ${statusConfig.label}`;

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: customerEmail,
      subject: `Order Update: ${statusConfig.label} - #${order.id.split('-')[0].toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #1f2937; padding: 20px;">
          <div style="background-color: #fff; padding: 30px; border-radius: 16px; border: 1px solid #f3f4f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            
            <div style="text-align: center; font-size: 48px; margin-bottom: 20px;">
              ${statusConfig.icon}
            </div>
            
            <h2 style="margin-top: 0; color: #111827; font-size: 22px; text-align: center;">Order ${statusConfig.label}</h2>
            
            <p style="font-size: 16px; line-height: 1.5; color: #4b5563; text-align: center;">
              Hi ${order.customer_name},<br>
              ${mainMessage}
            </p>
            
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/my-orders" style="display: inline-block; background-color: #f97316; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; text-align: center; width: 100%; box-sizing: border-box; margin-top: 20px;">
              View Details
            </a>
          </div>
        </div>
      `
    });
    console.log(`✉️ Order Status Email (${order.status}) sent to ${customerEmail}`);
  } catch (error) {
    console.error("❌ Failed to send status update email via Resend:", error);
  }
}

export async function sendAdminNewOrderEmail(order: Order) {
  if (!resend) return;

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "admin@apnaakhana.com";
  const itemsList = formatItemsList(order.items);
  const dashboardUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://apnaakhana.com";
  
  // Format Order ID visually concisely
  const shortOrderId = order.id.split('-')[0].toUpperCase();
  
  // Robustly format native Timestamp for India timezone explicitly
  let timestampDisplay = "Just now";
  if (order.created_at) {
    try {
      timestampDisplay = new Date(order.created_at).toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata', 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      });
    } catch {
      timestampDisplay = new Date(order.created_at).toLocaleString();
    }
  }

  const itemsHtml = itemsList.map(item => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 14px 10px; font-weight: 800; color: #f97316; width: 10%;">${item.quantity}x</td>
      <td style="padding: 14px 10px; color: #1f2937; line-height: 1.4;">${item.name}</td>
      <td style="text-align: right; padding: 14px 10px; font-weight: 700; color: #111827; width: 25%;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: adminEmail,
      subject: `🚨 NEW ORDER: #${shortOrderId} - ${order.customer_name}`,
      headers: {
        "Idempotency-Key": `admin-alert-${order.id}`
      },
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
          
          <!-- Header Banner -->
          <div style="background-color: #f97316; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">New Paid Order</h1>
            <div style="background-color: rgba(255,255,255,0.2); display: inline-block; padding: 6px 16px; border-radius: 9999px; margin-top: 12px;">
              <span style="color: #ffffff; font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px;">#${shortOrderId}</span>
            </div>
          </div>

          <!-- Body Container -->
          <div style="padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            
            <p style="margin: 0 0 25px 0; font-size: 15px; color: #6b7280; text-align: center;">
              Placed on <strong>${timestampDisplay}</strong>
            </p>
            
            <!-- Customer Card -->
            <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af;">Customer Details</h3>
              <div style="color: #1f2937; font-size: 15px; line-height: 1.6;">
                <p style="margin: 4px 0;"><strong>👤 Name:</strong> ${order.customer_name}</p>
                <p style="margin: 4px 0;"><strong>📞 Phone:</strong> <a href="tel:${order.phone_number}" style="color: #3b82f6; text-decoration: none;">${order.phone_number}</a></p>
                <p style="margin: 4px 0;"><strong>📍 Address:</strong> ${order.delivery_address}</p>
                ${order.instructions ? `<p style="margin: 12px 0 0 0; font-size: 14px; color: #b91c1c; background: #fef2f2; padding: 10px; border-radius: 6px; border: 1px solid #fecaca;"><strong>📝 Note:</strong> ${order.instructions}</p>` : ''}
              </div>
            </div>

            <!-- Items Table -->
            <div style="margin-bottom: 25px;">
              <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 15px; margin-bottom: 15px;">
                ${itemsHtml}
              </table>
              
              <!-- Grand Total Table (Email Safe) -->
              <table style="width: 100%; border-collapse: collapse; background-color: #fff7ed; border-radius: 8px; border: 1px solid #fed7aa; margin-top: 15px;">
                <tr>
                  <td style="padding: 24px; vertical-align: middle;">
                    <h4 style="margin: 0; color: #c2410c; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Grand Total</h4>
                  </td>
                  <td style="padding: 24px; text-align: right; vertical-align: middle;">
                    <h2 style="margin: 0; color: #ea580c; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">₹${order.total_price}</h2>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Payment Metadata -->
            <div style="text-align: center; margin-bottom: 35px; padding: 15px; border-top: 1px dashed #e5e7eb; border-bottom: 1px dashed #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Razorpay Txn ID</p>
              <p style="margin: 6px 0 0 0; font-family: 'Courier New', Courier, monospace; color: #374151; font-weight: 600; font-size: 15px;">${order.razorpay_payment_id || 'Captured via Webhook'}</p>
            </div>

            <!-- CTA Action -->
            <a href="${dashboardUrl}/admin/orders" style="display: block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 16px; border-radius: 8px; font-size: 16px; font-weight: bold; text-align: center; transition: background-color 0.2s;">
              View in Live Dashboard →
            </a>
          </div>
        </div>
      `
    });
    console.log(`📧 Admin notification email sent for order ${order.id}`);
  } catch (error) {
    console.error("❌ Failed to send admin notification email:", error);
  }
}
