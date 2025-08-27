import { useNavigate, useRoutes } from 'react-router'
import { lazy } from 'react'
import Pools from './components/pools/pools-ui'
import Launch from './components/launch/launch-ui'

const AccountDetailFeature = lazy(() => import('@/components/account/account-feature-detail.tsx'))
const AccountIndexFeature = lazy(() => import('@/components/account/account-feature-index.tsx'))
const LildexFeature = lazy(() => import('@/components/lildex/lildex-feature'))
const DashboardFeature = lazy(() => import('@/components/dashboard/dashboard-feature'))

export function AppRoutes() {
  const navigate = useNavigate()
  return useRoutes([
    { index: true, element: <DashboardFeature /> },
    {
      path: 'account',
      children: [
        {
          index: true,
          element: (
            <AccountIndexFeature
              redirect={(path: string) => {
                navigate(path)
                return null
              }}
            />
          ),
        },
        { path: ':address', element: <AccountDetailFeature /> },
      ],
    },
    {
      path: 'lildex',
      element: <LildexFeature />,
    },
    {
      path: 'pools',
      element: <Pools />,
    },
    {
      path: 'launch',
      element: <Launch />,
    },
  ])
}
