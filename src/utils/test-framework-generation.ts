import { supabase } from '@/integrations/supabase/client';
import { intelligentFrameworkGenerationService } from '@/services/intelligent-framework-generation-service';
import { toast } from 'sonner';

export async function testFrameworkGeneration() {
  try {
    console.log('Starting framework generation test...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Get user's organization profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error('No organization found for user');
    }

    // Get organizational profile
    const { data: orgProfile } = await supabase
      .from('organizational_profiles')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .single();

    if (!orgProfile) {
      throw new Error('Organizational profile not found');
    }

    console.log('Using organizational profile:', orgProfile);

    // Test framework generation
    const results = await intelligentFrameworkGenerationService.generateFrameworks({
      profileId: orgProfile.id,
      frameworkTypes: ['governance', 'risk_appetite'],
      customizations: {}
    });

    console.log('Framework generation results:', results);
    
    if (results.length > 0) {
      toast.success(`Generated ${results.length} test frameworks successfully!`);
      return true;
    } else {
      toast.warning('No frameworks were generated');
      return false;
    }
  } catch (error) {
    console.error('Test framework generation failed:', error);
    toast.error(`Test failed: ${error.message}`);
    return false;
  }
}