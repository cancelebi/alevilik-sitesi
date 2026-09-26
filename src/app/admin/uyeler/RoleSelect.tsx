'use client';

import { useTransition } from 'react';
import { updateUserRole } from '@/app/actions/admin';

export default function RoleSelect({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (confirm(`Kullanıcının yetkisini "${newRole}" olarak değiştirmek istediğinize emin misiniz?`)) {
      startTransition(async () => {
        const res = await updateUserRole(userId, newRole);
        if (res.error) {
          alert(res.error);
        }
      });
    } else {
      // Revert select visually if cancelled
      e.target.value = currentRole;
    }
  };

  return (
    <select 
      value={currentRole}
      onChange={handleRoleChange}
      disabled={isPending}
      className="text-xs p-1.5 border border-line-dark rounded bg-white text-dark focus:outline-none focus:border-copper cursor-pointer disabled:opacity-50"
    >
      <option value="user">Normal Üye</option>
      <option value="editor">Editör (Yazar)</option>
      <option value="dede">Dede (Köşe Yazarı)</option>
      <option value="admin">Admin (Yönetici)</option>
    </select>
  );
}
