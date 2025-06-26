'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import PasswordForm from './PasswordForm';

export default function FormSwitcher() {
  const [showResetForm, setShowResetForm] = useState(false);

  return showResetForm ? (
    <PasswordForm onBackToLogin={() => setShowResetForm(false)} />
  ) : (
    <LoginForm onForgotPassword={() => setShowResetForm(true)} />
  );
}
