import { useState } from 'react'
import { useRouter } from 'next/router'

import useRequest from '../../hooks/use-request'

const Signup = () => {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const { doRequest, errors } = useRequest({
		url: '/api/users/signup',
		method: 'post',
		body: { email, password },
		onSuccess: () => router.push('/'),
	})

	const onSubmit = async (event) => {
		event.preventDefault()

		doRequest()
	}

	return (
		<form onSubmit={onSubmit}>
			<h1>Sign up</h1>
			<div className='form-group'>
				<label>Email address</label>
				<input
					type='email'
					className='form-control'
					value={email}
					onChange={(event) => setEmail(event.currentTarget.value)}
				/>
			</div>
			<div className='form-group'>
				<label>Password</label>
				<input
					type='password'
					className='form-control'
					value={password}
					onChange={(event) => setPassword(event.currentTarget.value)}
				/>
			</div>
			{errors}
			<button className='btn btn-primary'>Sign up</button>
		</form>
	)
}

export default Signup
