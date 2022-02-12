import axios from 'axios'
import { useState } from 'react'

const useRequest = ({ url, method, body, onSuccess }) => {
	const [errors, setErrors] = useState(null)

	const doRequest = async (props = {}) => {
		try {
			setErrors(null)
			const response = await axios[method](url, { ...body, ...props })
			onSuccess?.(response.data)
			return response.data
		} catch (error) {
			console.log('error: ', error)
			setErrors(
				<div className='alert alert-danger'>
					<h4>Oopss...</h4>
					<ul>
						{error.response.data.errors.map((error) => (
							<li key={error.message}>{error.message}</li>
						))}
					</ul>
				</div>
			)
		}
	}

	return { doRequest, errors }
}

export default useRequest
