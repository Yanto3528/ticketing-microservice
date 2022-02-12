import { useEffect } from 'react'
import { useRouter } from 'next/router'

import useRequest from '../../hooks/use-request'

const SignIn = () => {
	const router = useRouter()
	const { doRequest } = useRequest({
		url: '/api/users/signout',
		method: 'post',
		onSuccess: () => router.push('/'),
	})

	useEffect(() => {
		doRequest()
	}, [])

	return <div>Signing you out...</div>
}

export default SignIn
