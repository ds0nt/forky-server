
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
			} else {
				this.ops.push(ops);				
			}
		},

		// OpBuilder().op('type', args)
		op: function(func) {
			ops = optory[func].apply(this, Array.prototype.slice.call(arguments, 1));
			this._op(ops);
			return this;
		},

		done: function() {
			return { 
				op: this.ops 
			};
		},
	};
}


OpBuilder.opifier = function(id, fn) {
	optory[id] = fn;
};


module.exports = OpBuilder;