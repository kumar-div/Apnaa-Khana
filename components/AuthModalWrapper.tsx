"use client";

import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

export default function AuthModalWrapper() {
  const { isAuthModalOpen, closeAuthModal, authModalCallback } = useAuth();

  return (
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      onSuccess={authModalCallback || undefined}
    />
  );
}
