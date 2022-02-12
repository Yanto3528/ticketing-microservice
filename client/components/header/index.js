import Link from 'next/link'

const Header = ({ currentUser }) => {
	const links = [
		!currentUser && { label: 'Sign in', href: '/auth/signin' },
		!currentUser && { label: 'Sign up', href: '/auth/signup' },
		currentUser && { label: 'Sell ticket', href: '/tickets/new' },
		currentUser && { label: 'My orders', href: '/orders' },
		currentUser && { label: 'Sign out', href: '/auth/signout' },
	]
		.filter((link) => link)
		.map((item) => {
			return (
				<li key={item.href} className='nav-item'>
					<Link href={item.href}>
						<a className='nav-link'>{item.label}</a>
					</Link>
				</li>
			)
		})

	return (
		<nav className='navbar navbar-light bg-light'>
			<Link href='/'>
				<a className='navbar-brand'>GitTix</a>
			</Link>
			<div className='d-flex justify-content-end'>
				<ul className='nav d-flex align-items-center'>{links}</ul>
			</div>
		</nav>
	)
}

export default Header
