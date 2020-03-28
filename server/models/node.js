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
	relations: {
        type: [nodeSchema],
	},
}, {
	timestamps: true
});

nodeSchema.methods.toJSON = function () {
	const node = this;
	const nodeObject = node.toObject();
	return nodeObject;
};

// Delete node relations when user is removed
// nodeSchema.pre('remove', async function (next) {
//     const node = this;
//     // await Node.deleteMany({ owner: user._id });
//     next();
// });

const Node = mongoose.model('User', nodeSchema);

module.exports = Node;