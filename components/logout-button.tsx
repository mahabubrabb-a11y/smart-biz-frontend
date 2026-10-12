'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');

    router.replace('/login');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
    >
      Logout
    </button>
  );
}