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

      if(reqRoute[0] === ":userId") {
        const userList = await model.findOne({_id: req.params.userId}).select(`lists.${req.params.list} -_id`)
        const file = await model.findOne({_id: req.params.userId}).
          populate({
            path: `lists.${req.params.list}`,
            options: {
              limit: limit,
              skip: startIndex
            }
          }).
          select(`lists.${req.params.list} -_id`).
          exec()

        files = file.lists[req.params.list]
        filesLength = userList.lists[req.params.list].length
      }

      if(reqRoute[0] === "uploads") {
        const userList = await model.findOne({_id: req.params.userId}).select(`uploads.${req.params.type} -_id`)
        const file = await model.findOne({_id: req.params.userId}).
          populate({
            path: `uploads.${req.params.type}`,
            options: {
              limit: limit,
              skip: startIndex
            }
          }).
          select(`uploads.${req.params.type} -_id`).
          sort({title: 1}).
          exec()

        files = file.uploads[req.params.type]
        filesLength = userList.uploads[req.params.type].length
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