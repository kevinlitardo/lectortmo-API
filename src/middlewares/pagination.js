function pagination (model) {
  return async (req, res, next) => {
    const reqRoute = req.route.path.split('/').slice(1)
    const demo = req.params.demography ? req.params.demography.slice(1) : null
    const type = req.params.type ? req.params.type.slice(1, -1) : null
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const order = req.query.order
  
    const startIndex = (page - 1) * limit
    const results = {}

    
    try {
      let filesLength
      let files
      let sort = null
      
      if(order === "rating") {sort = {rating: -1}}
      if(order === "recent") {sort = {createdAt: -1}}
      if(order === "alphabetically") {sort = {title: 1}}
      
      if(!order) {sort = null}

      if(reqRoute[0] === "recent") {
        filesLength = await model.find({}).countDocuments().exec()
        files = await model.find({}).
          limit(limit).
          skip(startIndex).
          sort({createdAt: -1}).
          exec()
      }

      if(reqRoute[0] === "trending") {
        if(demo){
          filesLength = await model.find({"demography": {"$regex": demo}}).countDocuments().exec()
          files = await model.find({"demography": {"$regex": demo}}).
            limit(limit).
            skip(startIndex).
            sort({rating: -1}).
            exec()
          }
          
        if(!demo){
          filesLength = await model.find({}).countDocuments().exec()
          files = await model.find({}).
            limit(limit).
            skip(startIndex).
            sort({rating: -1}).
            exec()
        }
      }

      if(reqRoute[0] === 'type' || reqRoute[0] === 'demo') {
        if(type){
          filesLength = await model.find({"type": {"$regex": type}}).countDocuments().exec()
          files = await model.find({"type": {"$regex": type}}).
            limit(limit).
            skip(startIndex).
            sort(sort).
            exec()
        }

        if(demo){
          filesLength = await model.find({"demography": {"$regex": demo}}).countDocuments().exec()
          files = await model.find({"demography": {"$regex": demo}}).
            limit(limit).
            skip(startIndex).
            sort(sort).
            exec()
        }
      }

      const totalPages = filesLength / limit
      const loadedFiles = (page - 1) * limit + files.length
      results.page = {
        page: page + " / " + Math.ceil(totalPages),
        loaded_files: loadedFiles + " / " + filesLength,
        limit: limit
      }

      if(files.length === 0) {
        results.page = {
          page: `null / ${Math.ceil(totalPages)}`,
          loaded_files: 0 + " / " + filesLength,
          limit: limit
        }
      }

      results.results = files
      res.pagination = results
      next()
    } catch (err) {
      res.status(500).send(err)    
    }
  }
}

module.exports = {pagination}