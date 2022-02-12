import { OrderStatus } from '@ylticket/common'
import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface OrderAttrs {
	id: string
	version: number
	userId: string
	status: OrderStatus
	price: number
}

interface OrderDoc extends mongoose.Document {
	version: number
	userId: string
	status: OrderStatus
	price: number
}

interface OrderModel extends mongoose.Model<OrderDoc> {
	build(attrs: OrderAttrs): OrderDoc
}

const OrderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id
				delete ret._id
			},
		},
	}
)

OrderSchema.set('versionKey', 'version')
OrderSchema.plugin(updateIfCurrentPlugin)

OrderSchema.statics.build = (attrs: OrderAttrs) => {
	return new Order({
		_id: attrs.id,
		status: attrs.status,
		version: attrs.version,
		userId: attrs.userId,
		price: attrs.price,
	})
}

export const Order = mongoose.model<OrderDoc, OrderModel>('Order', OrderSchema)
