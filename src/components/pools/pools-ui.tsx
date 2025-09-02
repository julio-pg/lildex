import { ellipsify } from '@/lib/utils'
import ComingSoon from '../ui/coming-soon'
import { usePoolAccountsQuery } from './pools-data-access'

export default function Pools() {
  const { data } = usePoolAccountsQuery()
  return (
    <div className="relative overflow-x-auto rounded-md">
      <table className="w-full text-sm text-left rtl:text-right bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400">
        <thead className="text-xs uppercase bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Pool
            </th>
            <th scope="col" className="px-6 py-3">
              Price{' '}
            </th>
            <th scope="col" className="px-6 py-3">
              Liquitidy
            </th>
            <th scope="col" className="px-6 py-3">
              Fee Rate
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.map(({ data }) => (
            <tr className="bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 ">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-xl">
                {`${ellipsify(data.tokenMintA)} / ${ellipsify(data.tokenMintB)}`}
              </th>
              <td className="px-6 py-4">${data.price / BigInt(100) ** BigInt(9)}</td>
              <td className="px-6 py-4">{data.liquidity}</td>
              <td className="px-6 py-4">{data.protocolFeeRate / 100}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
