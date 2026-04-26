import PaymentHistory from "@/features/shoopkeeper/payment/component/PaymentHistory";

export const metadata = {
  title: "Payment History | Shopkeeper Dashboard",
  description: "View and manage your payment history and invoices.",
};

export default function PaymentHistoryPage() {
  return <PaymentHistory />;
}
