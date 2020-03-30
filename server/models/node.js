const mongoose = require('mongoose');


const nodeSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	type: {
		type: String,
		required: true,
		trim: true
	},
	relations: [{
		type : mongoose.Schema.ObjectId,
		ref : 'Node'
	}]
}, {
	timestamps: true
});

nodeSchema.virtual('relationships', {
    ref: 'nodeSchema',
    localField: '_id',
    foreignField: 'relations'
});

const Node = mongoose.model('Node', nodeSchema);

module.exports = Node;