"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
function cartesianProduct(a) {
    return a.reduce(function (arr, n) { return n.reduce(function (x, ni) { return x.concat(arr.map(function (arri) { return arri.concat(ni); })); }, []); }, [[]]);
}
var DataCube = (function () {
    function DataCube(dimensions, splitter) {
        if (splitter === void 0) { splitter = ':'; }
        this.$$dimensions = dimensions;
        this.$$index = dimensions.reduce(function (o, d) { return (o[d] = [], o); }, {});
        this.$$bucket = {};
        this.$$splitter = splitter;
    }
    DataCube.prototype.query = function (query, raw) {
        var _this = this;
        var hdimensions = this.$$dimensions;
        var qdimensions = Object.keys(query);
        if (qdimensions.every(function (key) { return hdimensions.includes(key); })) {
            var keyArray = hdimensions.map(function (key) {
                if (qdimensions.includes(key)) {
                    return query[key].reduce(function (a, v) {
                        var idx = _this.$$index[key].indexOf(v);
                        if (idx !== -1) {
                            a.push(raw ? idx : {
                                index: idx,
                                dimension: key,
                                value: v
                            });
                        }
                        return a;
                    }, []);
                }
                else {
                    return raw
                        ? __spread(Array(_this.$$index[key].length).keys()) : _this.$$index[key].map(function (k, i) { return ({ index: i, dimension: key, value: k }); });
                }
            });
            return cartesianProduct(keyArray).reduce(function (a, k) {
                var hashKey = (raw ? k : k.map(function (x) { return x.index; })).join(_this.$$splitter);
                var t = _this.$$bucket[hashKey];
                if (_this.$$bucket.hasOwnProperty(hashKey)) {
                    a.push(raw ? t : {
                        value: t,
                        property: k.reduce(function (a, n) { return (a.push({ name: n.dimension, value: n.value }), a); }, [])
                    });
                }
                return a;
            }, []);
        }
        else {
            return [];
        }
    };
    DataCube.prototype.addDimensionValue = function (d, v) {
        if (this.$$dimensions.includes(d)) {
            var idx = this.$$index[d].indexOf(v);
            if (idx < 0) {
                this.$$index[d].push(v);
                return this.$$index[d].length - 1;
            }
            else {
                return idx;
            }
        }
        return -1;
    };
    DataCube.prototype.add = function (raw, property, force) {
        var _this = this;
        if (force === void 0) { force = false; }
        var hdimensions = this.$$dimensions;
        var rdimensions = Object.keys(property);
        if (rdimensions.length === hdimensions.length && rdimensions.every(function (key) { return hdimensions.includes(key); })) {
            var hashKey = hdimensions.map(function (d) {
                return _this.addDimensionValue(d, property[d]);
            }).join(this.$$splitter);
            if (this.$$bucket[hashKey] === undefined || force) {
                this.$$bucket[hashKey] = raw;
            }
        }
        return this;
    };
    DataCube.prototype.remove = function (property) {
        var _this = this;
        var hdimensions = this.$$dimensions;
        var qdimensions = Object.keys(property).filter(function (key) { return hdimensions.includes(key); });
        var keyArray = hdimensions.map(function (key) {
            if (qdimensions.includes(key)) {
                return property[key].reduce(function (a, v) {
                    var idx = _this.$$index[key].indexOf(v);
                    if (idx !== -1) {
                        a.push(idx);
                    }
                    return a;
                }, []);
            }
            else {
                return __spread(Array(_this.$$index[key].length).keys());
            }
        });
        cartesianProduct(keyArray).forEach(function (k) {
            delete _this.$$bucket[k.join(_this.$$splitter)];
        });
        return this;
    };
    DataCube.prototype.clear = function () {
        this.$$bucket = {};
        return this;
    };
    DataCube.prototype.toJSON = function (splitter) {
        var _this = this;
        if (splitter && splitter !== this.$$splitter) {
            return {
                dimensions: this.$$dimensions,
                index: this.$$index,
                splitter: splitter,
                data: Object.keys(this.$$bucket).reduce(function (o, k) {
                    o[k.replace(_this.$$splitter, splitter)] = _this.$$bucket[k];
                    return o;
                }, {})
            };
        }
        else {
            return {
                dimensions: this.$$dimensions,
                index: this.$$index,
                splitter: this.$$splitter,
                data: this.$$bucket
            };
        }
    };
    DataCube.prototype.fromJSON = function (json) {
        var _a = JSON.parse(JSON.stringify(json)), dimensions = _a.dimensions, index = _a.index, data = _a.data, _b = _a.splitter, splitter = _b === void 0 ? ':' : _b;
        this.$$dimensions = dimensions;
        this.$$index = index;
        this.$$bucket = data;
        this.$$splitter = splitter;
        return this;
    };
    return DataCube;
}());
exports.default = DataCube;
//# sourceMappingURL=index.js.map