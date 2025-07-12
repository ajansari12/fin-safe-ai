-- Phase 1: Fix Database Schema - Add missing role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Add check constraint for valid roles
ALTER TABLE public.profiles ADD CONSTRAINT valid_roles CHECK (role IN ('user', 'admin', 'analyst', 'reviewer', 'super_admin'));

-- Update existing profiles to have the user role if they don't already have one
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;