import { supabase } from './supabase';

export async function checkSubscriptionStatus() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { hasAccess: false, status: 'no_user' };

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status, trial_ends_at')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) {
      console.error('Error fetching subscription:', error);
      return { hasAccess: true, status: 'error' };
    }

    return {
      hasAccess: true,
      status: profile.subscription_status || 'inactive',
      trialEndsAt: profile.trial_ends_at
    };
  } catch (error) {
    console.error('Subscription check error:', error);
    return { hasAccess: true, status: 'error' };
  }
}
