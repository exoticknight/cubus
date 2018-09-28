function cartesianProduct(a) {
	return a.reduce((arr, n) => n.reduce((x, ni) => x.concat(arr.map(arri => arri.concat(ni))), []), [[]])
}

type Index = {
  [key:string]:string[];
}

type Bucket<T> = {
  [key:string]:T;
}

export type DataCubeJSON<T> = {
  dimensions:string[];
  index:Index;
  data:Bucket<T>;
  splitter:string;
}

export type Query = {
  [key:string]:string[];
}

export type Result<T> = {
  value:T;
  property:{
    [key:string]:string;
  }
}

export default class DataCube<T> {
  private $$dimensions:string[];
  private $$index:Index;
  private $$bucket:Bucket<T>;
  private $$splitter:string;

  constructor(dimensions:string[], splitter=':', index:Index={}, bucket:Bucket<T>={}) {
    this.$$dimensions = dimensions
    this.$$index = dimensions.reduce((o, d) => (o[d]=[], o), {})
    this.$$bucket = bucket
    this.$$splitter = splitter
  }

  query(query:Query):Result<T>[];
  query(query:Query, raw:boolean):T[];
  query(query:Query, raw?:any):Result<T>[] | T[] {
    const hdimensions = this.$$dimensions
    const qdimensions = Object.keys(query)
    if (qdimensions.every(key => hdimensions.includes(key))) {
      const keyArray = hdimensions.map(key => {
        if (qdimensions.includes(key)) {
          return query[key].reduce((a, v) => {
            const idx = this.$$index[key].indexOf(v)
            if (idx !== -1) {
              a.push(raw ? idx : {
                index: idx,
                dimension: key,
                value: v
              })
            }
            return a
          }, [])
        } else {
          return raw
            ? [...Array(this.$$index[key].length).keys()]
            : this.$$index[key].map((k, i) => ({index: i, dimension: key, value: k}))
        }
      })

      return cartesianProduct(keyArray).reduce((a, k) => {
        const hashKey = (raw ? k : k.map(x => x.index)).join(this.$$splitter)
        const t = this.$$bucket[hashKey]
        if (this.$$bucket.hasOwnProperty(hashKey)) {
          a.push(raw ? t : {
            value: t,
            property: k.reduce((o, n) => (o[n.dimension] = n.value,o), {})
          })
        }
        return a
      }, [])
    } else {
      return []
    }
  }

  addDimensionValue(d:string, v:string):number {
    if (this.$$dimensions.includes(d)) {
      const idx = this.$$index[d].indexOf(v)
      if (idx < 0) {
        this.$$index[d].push(v)
        return this.$$index[d].length - 1
      } else {
        return idx
      }
    }
    return -1
  }

  add(raw:T, property:{[key:string]:string}, force:boolean=false):this {
    const hdimensions = this.$$dimensions
    const rdimensions = Object.keys(property)
    if (rdimensions.length === hdimensions.length && rdimensions.every(key => hdimensions.includes(key))) {
      const hashKey:string = hdimensions.map(d => {
        return this.addDimensionValue(d, property[d])
      }).join(this.$$splitter)

      if (this.$$bucket[hashKey] === undefined || force) {
        this.$$bucket[hashKey] = raw
      }
    }

    return this
  }

  remove(property:{[key:string]:string[]}):this {
    const hdimensions = this.$$dimensions
    const qdimensions = Object.keys(property).filter(key => hdimensions.includes(key))

    const keyArray = hdimensions.map(key => {
      if (qdimensions.includes(key)) {
        return property[key].reduce((a, v) => {
          const idx = this.$$index[key].indexOf(v)
          if (idx !== -1) {
            a.push(idx)
          }
          return a
        }, [])
      } else {
        return [...Array(this.$$index[key].length).keys()]
      }
    })

    cartesianProduct(keyArray).forEach(k => {
      delete this.$$bucket[k.join(this.$$splitter)]
    })

    return this
  }

  clear():this {
    this.$$bucket = {}
    return this
  }

  toJSON(splitter?:string):DataCubeJSON<T> {
    if (splitter && splitter !== this.$$splitter) {
      return {
        dimensions: this.$$dimensions,
        index: this.$$index,
        splitter: splitter,
        data: Object.keys(this.$$bucket).reduce((o, k) => {
          o[k.replace(this.$$splitter, splitter)] = this.$$bucket[k]
          return o
        }, {})
      }
    } else {
      return {
        dimensions: this.$$dimensions,
        index: this.$$index,
        splitter: this.$$splitter,
        data: this.$$bucket
      }
    }
  }

  fromJSON<T>(json:DataCubeJSON<T>):this {
    const {dimensions, index, data, splitter=':'} = JSON.parse(JSON.stringify(json))
    this.$$dimensions = dimensions
    this.$$index = index
    this.$$bucket = data
    this.$$splitter = splitter

    return this
  }
}