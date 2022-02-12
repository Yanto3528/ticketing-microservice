import axios from 'axios'
import Link from 'next/link'
import buildClient from '../api/build-client'

export default function Home({ currentUser, tickets }) {
	console.log('tickets: ', tickets)
	return (
		<div>
			<h1>Tickets</h1>
			<table className='table'>
				<thead>
					<tr>
						<th>Title</th>
						<th>Price</th>
						<th>Link</th>
					</tr>
				</thead>
				<tbody>
					{tickets.map((ticket) => {
						return (
							<tr key={ticket.id}>
								<td>{ticket.title}</td>
								<td>{ticket.price}</td>
								<td>
									<Link href={`/tickets/${ticket.id}`}>
										<a>View</a>
									</Link>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}

export const getServerSideProps = async (context) => {
	const client = buildClient(context)
	const { data } = await client.get('/api/tickets')

	return {
		props: {
			tickets: data,
		},
	}
}
