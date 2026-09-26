"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api, { getErrorMessage } from '@/lib/api';
import { format } from 'date-fns';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.patch('/users/profile', data);
      updateUser(res.data);
      setSuccess('Profile updated successfully');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update profile'));
    }
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Profile Settings</h1>

        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-border">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-4xl text-primary-foreground font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              {user.createdAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Member since {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                </p>
              )}
            </div>
          </div>

          {error && <div className="p-4 mb-6 text-destructive bg-destructive/10 rounded-lg text-sm">{error}</div>}
          {success && <div className="p-4 mb-6 text-accent bg-accent/10 rounded-lg text-sm">{success}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full px-4 py-2 border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
              {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border rounded-md bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
