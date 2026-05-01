import NotificationDropdown from "@/features/notifications/component/NotificationDropdown";

export default function CustomerNotificationsPage() {
  return (
    <div className="p-4 md:p-10 max-w-[900px] mx-auto font-poppins">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A]">
          Notifications
        </h1>
        <p className="mt-2 text-sm font-medium text-[#64748B]">
          Open the notification menu to review your latest account and repair
          updates.
        </p>
        <div className="mt-8 inline-flex">
          <NotificationDropdown role="customer" />
        </div>
      </div>
    </div>
  );
}
