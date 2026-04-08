import mongoose from "mongoose";


const OrderSchema = new mongoose.Schema({
    user: {
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        }
    },
    products: [{
        _id: false,
        id: {
            type:Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
},
    ],
    status: {
        type: String,
        required: true,
        enum: ['Pedido recebido', 'Em preparação', 'Saiu para entrega', 'Entregue'],
        default: 'Pedido recebido',
    },
}, 
{ 
    timestamps: true, 
},
        
    );

    export default mongoose.model('Order', OrderSchema);