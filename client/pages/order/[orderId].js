import { useState, useEffect } from 'react'
import Router from 'next/router'
import StripeCheckout from 'react-stripe-checkout'
import buildClient from '../../api/build-client'
import useRequest from '../../hooks/use-request'

const OrderShow = ({ order, currentUser }) => {
	const [timeLeft, setTimeLeft] = useState(0)
	const { doRequest, errors } = useRequest({
		url: '/api/payments',
		method: 'post',
		body: {
			orderId: order.id,
		},
		onSuccess: () => Router.push('/order'),
	})

	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft = new Date(order.expiresAt) - new Date()
			setTimeLeft(Math.round(msLeft / 1000))
		}

		findTimeLeft()
		const timerId = setInterval(findTimeLeft, 1000)

		return () => {
			clearInterval(timerId)
		}
	})

	if (timeLeft < 0) {
		return <div>Order expired</div>
	}

	return (
		<div>
			<p>Time left to pay: {timeLeft} seconds</p>
			<StripeCheckout
				token={({ id }) => doRequest({ token: id })}
				stripeKey='pk_test_1gr9InTvF72oGbFexhZkUg8p005IXvJ66R'
				amount={order.ticket.price * 100}
				email={currentUser.email}
			/>
			{errors}
		</div>
	)
}

export const getServerSideProps = async (context) => {
	const client = buildClient(context)
	const { data } = await client.get(`/api/orders/${context.query.orderId}`)

	return {
		props: {
			order: data,
		},
	}
}

export default OrderShow
