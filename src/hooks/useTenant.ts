import { useQuery } from '@tanstack/react-query'
import { getTenantConfig } from '../lib/tenant-config'

export function useTenant() {
  const tenantId = typeof window !== 'undefined' 
    ? window.document.querySelector('meta[name="tenant-id"]')?.getAttribute('content')
    : null

  return useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => getTenantConfig(window.location.hostname),
    enabled: typeof window !== 'undefined',
  })
}
