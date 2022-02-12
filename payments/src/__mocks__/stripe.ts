const id = `${Math.floor(Math.random() * 10000)}.${new Date().toISOString()}`

export const stripe = {
	charges: {
		create: jest.fn().mockResolvedValue({ id }),
		retrieve: jest.fn().mockResolvedValue({ id }),
	},
}
