export type OrderStatus =
  | "pending"
  | "confirmed"
  | "accepted"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "failed";

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email?: string;
  phone_number: string;
  delivery_address: string;
  items: OrderItem[];
  total_price: number;
  instructions: string;
  payment_status: string;
  status: OrderStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-900 dark:text-amber-200",
    bgColor:
      "bg-amber-100 dark:bg-amber-800/60 border-amber-300 dark:border-amber-600/50",
    icon: "⏳",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-sky-900 dark:text-sky-200",
    bgColor:
      "bg-sky-100 dark:bg-sky-800/60 border-sky-300 dark:border-sky-600/50",
    icon: "💳",
  },
  accepted: {
    label: "Accepted",
    color: "text-blue-900 dark:text-blue-200",
    bgColor:
      "bg-blue-100 dark:bg-blue-800/60 border-blue-300 dark:border-blue-600/50",
    icon: "✅",
  },
  preparing: {
    label: "Preparing",
    color: "text-purple-900 dark:text-purple-200",
    bgColor:
      "bg-purple-100 dark:bg-purple-800/60 border-purple-300 dark:border-purple-600/50",
    icon: "👨‍🍳",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-indigo-900 dark:text-indigo-200",
    bgColor:
      "bg-indigo-100 dark:bg-indigo-800/60 border-indigo-300 dark:border-indigo-600/50",
    icon: "🛵",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-900 dark:text-emerald-200",
    bgColor:
      "bg-emerald-100 dark:bg-emerald-800/60 border-emerald-300 dark:border-emerald-600/50",
    icon: "🎉",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-900 dark:text-red-200",
    bgColor:
      "bg-red-100 dark:bg-red-800/60 border-red-300 dark:border-red-600/50",
    icon: "❌",
  },
  failed: {
    label: "Payment Failed",
    color: "text-red-900 dark:text-red-200",
    bgColor:
      "bg-red-100 dark:bg-red-800/60 border-red-300 dark:border-red-600/50",
    icon: "⚠",
  },
};

// Payment status styling — independent semantic palette (green/yellow/red)
export const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  paid: {
    label: "Paid Online",
    color: "text-green-950 dark:text-green-100",
    bgColor: "bg-green-200 dark:bg-green-700/70 border-green-400 dark:border-green-500/60",
  },
  failed: {
    label: "Payment Failed",
    color: "text-rose-950 dark:text-rose-100",
    bgColor: "bg-rose-200 dark:bg-rose-700/70 border-rose-400 dark:border-rose-500/60",
  },
  pending: {
    label: "Pending Pay",
    color: "text-yellow-950 dark:text-yellow-100",
    bgColor: "bg-yellow-200 dark:bg-yellow-700/70 border-yellow-400 dark:border-yellow-500/60",
  },
};

// Card border glow based on payment status
export function getPaymentBorderClass(paymentStatus: string): string {
  switch (paymentStatus) {
    case "paid":
      return "border-emerald-200 dark:border-emerald-800/60 shadow-emerald-50 dark:shadow-emerald-950/20";
    case "failed":
      return "border-rose-200 dark:border-rose-800/60 shadow-rose-50 dark:shadow-rose-950/20";
    default:
      return "border-amber-200 dark:border-amber-800/60 shadow-amber-50 dark:shadow-amber-950/20";
  }
}

