"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Pencil,
  Eye,
  EyeOff,
  Camera,
  Loader2,
  Store,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMyProfile,
  useUpdateProfile,
  useChangePassword,
} from "../hooks/useSettings";
import {
  profileSchema,
  passwordSchema,
  ProfileValues,
  PasswordValues,
} from "../types";

export default function Settings() {
  const { data: profileData, isLoading } = useMyProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      shopName: "",
      shopAddress: "",
      whatsappNumber: "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (profileData?.data) {
      const user = profileData.data;
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        shopName: user.shopName || "",
        shopAddress: user.shopAddress || "",
        whatsappNumber: user.whatsappNumber || "",
      });
    }
  }, [profileData, profileForm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (profileData?.data?.image?.url) {
        setImagePreview(profileData.data.image.url);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [profileData?.data?.image?.url]);

  const onProfileSubmit = async (values: ProfileValues) => {
    const formData = new FormData();
    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("shopName", values.shopName);
    formData.append("shopAddress", values.shopAddress);
    formData.append("whatsappNumber", values.whatsappNumber);

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    await updateProfileMutation.mutateAsync(formData);
    setIsEditing(false);
  };

  const onPasswordSubmit = async (values: PasswordValues) => {
    await changePasswordMutation.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    passwordForm.reset();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = profileData?.data;

  return (
    <div className="p-4 md:p-10 bg-background  mx-auto space-y-8 font-poppins">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex items-center gap-6"
      >
        <div
          className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-muted shadow-inner group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image
            src={
              imagePreview ||
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
            }
            alt="Profile"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white w-6 h-6" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-muted-foreground font-bold text-sm uppercase tracking-wider">
            {user?.role}
          </p>
        </div>
      </motion.div>

      {/* Personal Information Section */}
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden"
        >
          <div className="p-8 flex justify-between items-center border-b border-border/50">
            <h2 className="text-xl font-black text-foreground tracking-tight">
              Personal & Shop Information
            </h2>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-black text-sm rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
              >
                <Pencil size={16} strokeWidth={3} />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    profileForm.reset();
                  }}
                  className="px-6 py-2 bg-muted text-muted-foreground font-black text-sm rounded-xl hover:opacity-90 transition active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-black text-sm rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1">
                  First Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("firstName")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.firstName && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.firstName.message}
                  </span>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1">
                  Last Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("lastName")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.lastName && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.lastName.message}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <input
                  type="email"
                  disabled={true}
                  {...profileForm.register("email")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground opacity-50"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <Phone size={14} /> Phone
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("phone")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.phone && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.phone.message}
                  </span>
                )}
              </div>

              {/* Shop Name */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <Store size={14} /> Shop Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("shopName")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.shopName && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.shopName.message}
                  </span>
                )}
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <MessageCircle size={14} /> WhatsApp Number
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("whatsappNumber")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.whatsappNumber && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.whatsappNumber.message}
                  </span>
                )}
              </div>

              {/* Shop Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <MapPin size={14} /> Shop Address
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("shopAddress")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.shopAddress && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.shopAddress.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </form>

      {/* Change Password Section */}
      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden"
        >
          <div className="p-8 border-b border-border/50">
            <h2 className="text-xl font-black text-foreground tracking-tight">
              Change password
            </h2>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    {...passwordForm.register("currentPassword")}
                    className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground"
                    placeholder="..............."
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {passwordForm.formState.errors.currentPassword.message}
                  </span>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    {...passwordForm.register("newPassword")}
                    className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground"
                    placeholder="..............."
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
                  >
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {passwordForm.formState.errors.newPassword.message}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    {...passwordForm.register("confirmPassword")}
                    className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground"
                    placeholder="..............."
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="px-10 py-4 bg-primary text-primary-foreground font-black text-[15px] rounded-2xl hover:opacity-90 transition shadow-lg shadow-primary/20 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {changePasswordMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
