import { useState } from 'react'
import { useRouter } from 'next/router'
import useRequest from '../../hooks/use-request'

const NewTicket = () => {
	const [title, setTitle] = useState('')
	const [price, setPrice] = useState('')
	const router = useRouter()

	const { doRequest, errors } = useRequest({
		url: '/api/tickets',
		method: 'post',
		body: {
			title,
			price,
		},
		onSuccess: () => router.push('/'),
	})

	const onBlur = () => {
		const value = parseFloat(price)

		if (isNaN(value)) {
			return
		}

		setPrice(value.toFixed(2))
	}

	const onSubmit = (event) => {
		event.preventDefault()

		doRequest()
	}

	return (
		<div>
			<h1>Create a new ticket</h1>
			<form onSubmit={onSubmit}>
				<div className='form-group'>
					<label>Title</label>
					<input
						className='form-control'
						value={title}
						onChange={(event) => setTitle(event.currentTarget.value)}
					/>
				</div>
				<div className='form-group'>
					<label>Price</label>
					<input
						className='form-control'
						value={price}
						onChange={(event) => setPrice(event.currentTarget.value)}
						onBlur={onBlur}
					/>
				</div>
				{errors}
				<button className='btn btn-primary'>Submit</button>
			</form>
		</div>
	)
}

export default NewTicket
