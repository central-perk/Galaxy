var _ = require('lodash');

DaoBase = (function() {
	var instance = [];

	// 输出错误
	function errHandler(err, doc, callback) {
		if (err) console.log(err);
		callback(err, doc);
	}

	function constructor(Model) {
		//特权方法
		return {
			Model: Model,
			create: function(doc, callback) {
				Model.create(doc, function(err, raw) {
					return errHandler(err, raw, callback);
				});
			},
			find: function(conditions, callback) {
				Model.find(conditions, function(err, doc) {
					return errHandler(err, doc, callback);
				});
			},
			findOne: function(conditions, callback) {
				Model.findOne(conditions, function(err, doc) {
					return errHandler(err, doc, callback);
				});
			},
			findByID: function(_id, callback) {
				Model.findOne({_id: _id}, function(err, doc) {
					return errHandler(err, doc, callback);
				});
			},
			update: function(conditions, doc, callback) {
				if (doc._id) delete update._id;
				Model.update(conditions, doc, {}, function(err, numberAffected, raw) {
					return errHandler(err, raw, callback);
				});
			},
			remove: function(conditions, callback) {
				Model.remove(conditions, function(err) {
					return errHandler(err, null, callback);
				});
			},
			count: function(conditions, callback) {
				Model.count(conditions, function(error, count) {
					return errHandler(err, count, callback);
				});
			},

			// 以下均未复写
			createBySave: function(doc, callback) {
				var model;
				model = new Model(doc);
				return model.save(function(err, doc) {
					return callback(err, doc);
				});
			},
			save: function(model, callback) {
				model.save(function(error) {
					if (error) return callback(error);
					return callback(null, model);
				});
			},
			getOneByQueryPopulate: function(query, fileds, opt, populates, callback) {
				var tmp = Model.findOne(query, fileds, opt);
				for (var i = 0; i < populates.length; i++) {
					tmp.populate(populates[i]);
				}
				tmp.exec(callback);

			},
			getAll: function(callback) {
				Model.find({}, function(error, model) {
					if (error) return callback(error, null);
					return callback(null, model);
				});
			},
			fakeDelete: function(query, callback) {
				Model.update(query, {
					deleted: 1
				}, '', function(error) {
					if (error) return callback(error);
					return callback(null);
				});
			},

			list: function(options, sort, callback) {
				var criteria = options.criteria || {},
					seq;
				if (options.sql) {
					seq = Model.find(criteria, options.sql);
				} else {
					seq = Model.find(criteria);
				}
				seq.sort(sort)
					.limit(options.perPage)
					.skip(options.perPage * options.page)
					.exec(callback);
			},
			listAll: function(options, sort, callback) {
				var criteria = options.criteria || {},
					seq;
				sort = sort || {};

				if (options.sql) {
					seq = Model.find(criteria, options.sql);
				} else {
					seq = Model.find(criteria);
				}
				seq.sort(sort)
					.exec(callback);
			},
			listPopulate: function(options, sort, populates, callback) {
				var criteria = options.criteria || {};
				var tmp = Model.find(criteria);

				for (var i = populates.length - 1; i >= 0; i--) {
					tmp = tmp.populate(populates[i]);
				}
				tmp.sort(sort).limit(options.perPage)
					.skip(options.perPage * options.page)
					.exec(callback);
			},
			aggregate: function(query, callback) {
				Model.aggregate(query, function(error) {
					if (error) return callback(error);
					return callback(null);
				});
			}
		};
	}
	return {
		getInstance: function(Model) {
			if (_.indexOf(instance, Model) == -1) {
				instance.push(Model.collection.name);
			}
			return constructor(Model);
		}
	};
})();


module.exports = DaoBase;
