var path = require('path')
	, allStatic = {}
	, dataDir

function BjorlingStaticStorage(items, projectionName, key) {
	this._items = items
	this._key = key
	this._projectionName = projectionName
	this._indexes = {}
}

BjorlingStaticStorage.prototype.addIndex = function(index) {
	var key = this._key
		, items = this._items
		, indexObj = this._indexes[index] = {}
	Object.keys(items).forEach(function(itemKey) {
		var item = items[itemKey]
			, keyVal = item[key]
			, indexVal = item[index]
		indexObj[indexVal] = keyVal
	})
}

BjorlingStaticStorage.prototype.getKeyValue = function(obj) {
	return obj[this._key]
}

BjorlingStaticStorage.prototype.get = function(queryObj, cb) {
	var keyVal = this.getKeyValue(queryObj)
		, index = Object.keys(this._indexes)[0]
		, result = null
		, indexVal
	if(keyVal) {
		result = this._items[keyVal]
	} else if(index) {
		indexVal = queryObj[index]
		if(indexVal) {
			result = this._items[this._indexes[index][indexVal]]
		}
	}
	setImmediate(function() {
		cb && cb(null, result)
	})
	return result
}

function getStorage(dir) {
	dataDir = dir
	return getStatic
}

function getStatic(projectionName, key, cb) {
	var projection = allStatic[projectionName]
	if(!projection) {
		var items = require(path.join(dataDir, projectionName))
		projection = allStatic[projectionName] = new BjorlingStaticStorage(items, projectionName, key)
	}

	setImmediate(function() {
		cb && cb(null, projection)
	})
	return projection
}

function get(projectionName, keyVal) {
	var projection = allStatic[projectionName]
	if(!projection) {
		require(path.join(__dirname, projectionName))
		projection = allStatic[projectionName]
	}

	var queryObj = {}
	queryObj[projection._key] = keyVal
	return projection.get(queryObj)
}

function getAll(projectionName, cb) {
	setImmediate(function() {
		cb(null, allStatic[projectionName])
	})
}


module.exports = getStorage
module.exports.get = get
module.exports.getAll = getAll
