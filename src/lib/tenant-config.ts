export interface TenantConfig {
    storeSlug: string;
    domain: string;
  }
  
  // In production, this would come from a database
  const tenantConfigs = new Map<string, TenantConfig>([
    // Example configuration
    ['store1.example.com', { storeSlug: 'store1', domain: 'store1.example.com' }],
  ])
  
  export async function getTenantConfig(hostname: string | null): Promise<TenantConfig | undefined> {
    if (!hostname) return undefined
    
    // Remove port if present
    const domain = hostname.split(':')[0]
    
    // For local development, use the default store from env
    if (domain === 'localhost' || domain === 'guy.medtechanalytics.com') {
      return {
        storeSlug: process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG || 'default-store',
        domain: 'localhost'
      }
    }
    
    // In production, fetch from database
    return tenantConfigs.get(domain)
}