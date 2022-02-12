import buildClient from '../../api/build-client'
import useRequest from '../../hooks/use-request'
import Router from 'next/router'

const ShowTicket = ({ ticket }) => {
	const { doRequest, errors } = useRequest({
		url: '/api/orders',
		method: 'post',
		body: {
			ticketId: ticket.id,
		},
		onSuccess: (order) => Router.push(`/order/${order.id}`),
	})
	return (
		<div>
			<h1>{ticket.title}</h1>
			<h4>{ticket.price}</h4>
			{errors}
			<button className='btn btn-primary' onClick={() => doRequest()}>
				Purchase
			</button>
		</div>
	)
}

export const getServerSideProps = async (context) => {
	const client = buildClient(context)
	const { data } = await client.get(`/api/tickets/${context.query.ticketId}`)

	return {
		props: {
			ticket: data,
		},
	}
}

export default ShowTicket
