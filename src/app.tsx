import { AppProviders } from '@/components/app-providers.tsx'
import { AppLayout } from '@/components/app-layout.tsx'
import { AppRoutes } from '@/app-routes.tsx'

const links: { label: string; path: string }[] = [
  { label: 'Trade', path: '/' },
  { label: 'Pools', path: '/pools' },
  { label: 'Create', path: '/create' },
  { label: 'Launch', path: '/launch' },
]

export function App() {
  return (
    <AppProviders>
      <AppLayout links={links}>
        <AppRoutes />
      </AppLayout>
    </AppProviders>
  )
}
