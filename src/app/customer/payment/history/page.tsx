import PaymentHistory from "@/features/shopkeeper/payment/component/PaymentHistory";

export const metadata = {
  title: "Payment History | Customer Dashboard",
  description: "View and manage your payment history and invoices.",
};

export default function PaymentHistoryPage() {
  return <PaymentHistory />;
}
