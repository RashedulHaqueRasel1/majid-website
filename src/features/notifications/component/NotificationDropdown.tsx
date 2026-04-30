"use client";

import React, { useState } from "react";
import { Bell, CheckCheck, Inbox, Clock } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  useShopkeeperNotifications,
  useUserNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../hooks/useNotifications";
import { INotification } from "../types/notifications.types";
import NotificationDetailModal from "./NotificationDetailModal";

interface NotificationDropdownProps {
  role: "shopkeeper" | "customer";
}

export default function NotificationDropdown({
  role,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<INotification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch notifications based on role
  const { data: skNotifications, isLoading: skLoading } =
    useShopkeeperNotifications(1, 10);
  const { data: userNotifications, isLoading: userLoading } =
    useUserNotifications(1, 10);

  const notifications =
    role === "shopkeeper" ? skNotifications?.data : userNotifications?.data;
  const isLoading = role === "shopkeeper" ? skLoading : userLoading;

  const unreadCount = notifications?.filter((n) => !n.isViewed).length || 0;

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleMarkAsRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllRead.mutate();
  };

  const handleNotificationClick = (notification: INotification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    setOpen(false); // Close the dropdown
    if (!notification.isViewed) {
      handleMarkAsRead(notification._id);
    }
  };

  return (
    <>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button className="relative p-2.5 bg-gray-50 text-[#64748B] rounded-2xl hover:bg-gray-100 transition group cursor-pointer outline-none">
            <Bell
              size={20}
              className="group-hover:rotate-12 transition-transform"
            />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white animate-pulse" />
            )}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            asChild
            sideOffset={8}
            align="end"
            className="z-[100]"
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-[380px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0">
                <div>
                  <h3 className="text-[15px] font-black text-[#0F172A] tracking-tight">
                    Notifications
                  </h3>
                  <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mt-0.5">
                    You have {unreadCount} unread messages
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black text-[#84CC16] hover:bg-[#F7FEE7] transition uppercase tracking-wider"
                  >
                    <CheckCheck size={14} />
                    Mark all as read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="p-10 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-[#84CC16]/20 border-t-[#84CC16] rounded-full animate-spin" />
                    <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest">
                      Loading...
                    </p>
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onClick={handleNotificationClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                      <Inbox size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[14px] font-black text-[#0F172A]">
                        All caught up!
                      </p>
                      <p className="text-[12px] font-medium text-[#94A3B8]">
                        No new notifications at the moment.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button className="w-full py-2.5 text-[12px] font-black text-[#64748B] hover:text-[#0F172A] transition uppercase tracking-widest">
                  View All Notifications
                </button>
              </div>
            </motion.div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

function NotificationItem({
  notification,
  onClick,
}: {
  notification: INotification;
  onClick: (notification: INotification) => void;
}) {
  return (
    <div
      className={`p-5 hover:bg-gray-50 transition relative group cursor-pointer ${
        !notification.isViewed ? "bg-[#F7FEE7]/30" : ""
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex gap-4">
        {/* Icon/Avatar */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            !notification.isViewed
              ? "bg-[#84CC16]/10 text-[#84CC16]"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <Bell size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4
              className={`text-[13px] font-black truncate ${
                !notification.isViewed ? "text-[#0F172A]" : "text-[#64748B]"
              }`}
            >
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#94A3B8] whitespace-nowrap">
              <Clock size={10} />
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
          <p
            className={`text-[12px] leading-relaxed line-clamp-2 ${
              !notification.isViewed
                ? "font-bold text-[#475569]"
                : "font-medium text-[#94A3B8]"
            }`}
          >
            {notification.message}
          </p>
        </div>
      </div>

      {!notification.isViewed && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#84CC16] rounded-full" />
      )}
    </div>
  );
}
