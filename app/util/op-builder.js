
var _ = require('underscore');

var optory = {};

function OpBuilder(agent) {
	return {
		ops: [],
		agent: agent,

		_op: function(ops) {
			if (typeof ops === 'array') {
				for (var i = 0; i < ops.length; i++) {
					this.ops.push(ops);
				};
				return this;
			}

			this.ops.push(ops);
			return this;
		},

		// OpBuilder().op('type', args)
		op: function(func) {
			ops = optory[func].apply(this, Array.prototype.slice.call(arguments, 1));
			return this._op(ops);
		},

		opify: function() {
			return { op: this.ops };
		},
	};
}


OpBuilder.opifier = function(id, fn) {
	optory[id] = fn;
};


module.exports = OpBuilder;