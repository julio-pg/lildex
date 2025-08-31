import { Link } from 'react-router'

const links: { label: string; path: string }[] = [
  { label: 'Terms of Use', path: '#' },
  // { label: 'Privacy', path: '#' },
]

export function AppFooter() {
  return (
    <footer className="sticky bottom-0 text-center p-2 bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 text-xs">
      <div className="container mx-auto flex justify-between">
        <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-4">
          {links.map((link) => (
            <Link key={link.path} to={link.path} className="hover:underline" rel="noopener noreferrer">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-2">© {new Date().getFullYear()} LilDex</div>
      </div>
    </footer>
  )
}
