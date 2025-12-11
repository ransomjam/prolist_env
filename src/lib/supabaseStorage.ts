// Supabase-powered storage functions (replaces localStorage mock data)

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Profile, 
  Post, 
  Transaction, 
  TransactionStatus,
  VerificationFile,
  DeliveryLog,
  Notification,
  UserRole 
} from '@/types/database';

// Helper to check if supabase is available
function checkSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase not configured - returning empty data');
    return false;
  }
  return true;
}

// ============ PROFILES ============

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!checkSupabase()) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  if (!checkSupabase()) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

// ============ USER ROLES ============

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  return data?.map(r => r.role as UserRole) || [];
}

export async function addUserRole(userId: string, role: UserRole): Promise<void> {
  if (!checkSupabase()) return;
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role });
  if (error && !error.message.includes('duplicate')) throw error;
}

export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  if (!checkSupabase()) return false;
  const { data } = await supabase
    .rpc('has_role', { _user_id: userId, _role: role });
  return data || false;
}

// ============ POSTS ============

export async function getPosts(): Promise<Post[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      seller:profiles!posts_seller_id_fkey(*)
    `)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getPost(postId: string): Promise<Post | null> {
  if (!checkSupabase()) return null;
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      seller:profiles!posts_seller_id_fkey(*)
    `)
    .eq('id', postId)
    .maybeSingle();
  return data;
}

export async function getSellerPosts(sellerId: string): Promise<Post[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post | null> {
  if (!checkSupabase()) return null;
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<Post | null> {
  if (!checkSupabase()) return null;
  const { data, error } = await supabase
    .from('posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deletePost(postId: string): Promise<void> {
  if (!checkSupabase()) return;
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);
  if (error) throw error;
}

// ============ TRANSACTIONS ============

export async function getTransactions(): Promise<Transaction[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('transactions')
    .select(`
      *,
      buyer:profiles!transactions_buyer_id_fkey(*),
      seller:profiles!transactions_seller_id_fkey(*),
      post:posts(*),
      agent:profiles!transactions_assigned_agent_id_fkey(*)
    `)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  if (!checkSupabase()) return null;
  const { data } = await supabase
    .from('transactions')
    .select(`
      *,
      buyer:profiles!transactions_buyer_id_fkey(*),
      seller:profiles!transactions_seller_id_fkey(*),
      post:posts(*),
      agent:profiles!transactions_assigned_agent_id_fkey(*)
    `)
    .eq('id', transactionId)
    .maybeSingle();
  return data;
}

export async function getBuyerTransactions(buyerId: string): Promise<Transaction[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('transactions')
    .select(`
      *,
      seller:profiles!transactions_seller_id_fkey(*),
      post:posts(*)
    `)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getSellerTransactions(sellerId: string): Promise<Transaction[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('transactions')
    .select(`
      *,
      buyer:profiles!transactions_buyer_id_fkey(*),
      post:posts(*)
    `)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getAgentTransactions(agentId: string): Promise<Transaction[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('transactions')
    .select(`
      *,
      buyer:profiles!transactions_buyer_id_fkey(*),
      seller:profiles!transactions_seller_id_fkey(*),
      post:posts(*)
    `)
    .eq('assigned_agent_id', agentId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction | null> {
  if (!checkSupabase()) return null;
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateTransactionStatus(
  transactionId: string, 
  status: TransactionStatus,
  additionalUpdates?: Partial<Transaction>
): Promise<Transaction | null> {
  if (!checkSupabase()) return null;
  const updates: Partial<Transaction> = {
    status,
    updated_at: new Date().toISOString(),
    ...additionalUpdates,
  };
  
  // Set timestamps for specific statuses
  if (status === 'ESCROW_HELD') {
    updates.escrow_held_at = new Date().toISOString();
  } else if (status === 'COMPLETED') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function assignAgent(transactionId: string, agentId: string): Promise<void> {
  if (!checkSupabase()) return;
  const { error } = await supabase
    .from('transactions')
    .update({ 
      assigned_agent_id: agentId,
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId);
  
  if (error) throw error;
}

// ============ VERIFICATION FILES ============

export async function uploadVerificationFile(
  userId: string, 
  fileType: 'id_card' | 'selfie', 
  file: File
): Promise<string> {
  if (!checkSupabase()) throw new Error('Backend not configured');
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${fileType}_${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('verification')
    .upload(fileName, file);
  
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('verification')
    .getPublicUrl(fileName);

  // Save to verification_files table
  const { error } = await supabase
    .from('verification_files')
    .insert({
      user_id: userId,
      type: fileType,
      file_url: publicUrl,
    });
  
  if (error) throw error;
  
  return publicUrl;
}

export async function getVerificationFiles(userId: string): Promise<VerificationFile[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('verification_files')
    .select('*')
    .eq('user_id', userId);
  return data || [];
}

export async function getPendingVerifications(): Promise<Profile[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('verification_status', 'PENDING');
  return data || [];
}

export async function approveVerification(userId: string): Promise<void> {
  if (!checkSupabase()) return;
  const { error } = await supabase
    .from('profiles')
    .update({ 
      verification_status: 'VERIFIED',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  if (error) throw error;

  // Add SELLER role
  await addUserRole(userId, 'SELLER');
}

export async function rejectVerification(userId: string): Promise<void> {
  if (!checkSupabase()) return;
  const { error } = await supabase
    .from('profiles')
    .update({ 
      verification_status: 'REJECTED',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  if (error) throw error;
}

// ============ DELIVERY LOGS ============

export async function addDeliveryLog(log: Omit<DeliveryLog, 'id' | 'created_at'>): Promise<DeliveryLog | null> {
  if (!checkSupabase()) return null;
  const { data, error } = await supabase
    .from('delivery_logs')
    .insert(log)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getDeliveryLogs(transactionId: string): Promise<DeliveryLog[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('delivery_logs')
    .select(`
      *,
      agent:profiles!delivery_logs_agent_id_fkey(*)
    `)
    .eq('transaction_id', transactionId)
    .order('created_at', { ascending: true });
  return data || [];
}

// ============ NOTIFICATIONS ============

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
  if (!checkSupabase()) return;
  const { error } = await supabase
    .from('notifications')
    .insert(notification);
  if (error) throw error;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  if (!checkSupabase()) return;
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!checkSupabase()) return;
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!checkSupabase()) return 0;
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  return count || 0;
}

// ============ AGENTS ============

export async function getAgents(): Promise<Profile[]> {
  if (!checkSupabase()) return [];
  const { data } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'AGENT');
  
  if (!data || data.length === 0) return [];
  
  const agentIds = data.map(r => r.user_id);
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', agentIds);
  
  return profiles || [];
}

// ============ UPLOAD IMAGE ============

export async function uploadPostImage(sellerId: string, file: File): Promise<string> {
  if (!checkSupabase()) throw new Error('Backend not configured');
  const fileExt = file.name.split('.').pop();
  const fileName = `${sellerId}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(fileName, file);
  
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName);
  
  return publicUrl;
}

// ============ HELPERS ============

export function formatPriceXAF(price: number): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + " XAF";
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateConfirmationCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}
