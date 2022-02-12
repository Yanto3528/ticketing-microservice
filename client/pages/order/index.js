import buildClient from '../../api/build-client'

const OrderShow = ({ orders }) => {
	return (
		<div>
			<h1>My Orders</h1>
			<table className='table'>
				<thead>
					<tr>
						<th>Name</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{orders.map((order) => {
						return (
							<tr key={order.id}>
								<td>{order.ticket.title}</td>
								<td>{order.status}</td>
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
	const { data } = await client.get(`/api/orders`)

	return {
		props: {
			orders: data,
		},
	}
}

export default OrderShow
