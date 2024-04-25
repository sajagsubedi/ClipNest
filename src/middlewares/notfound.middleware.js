const notfound = (req, res,)=> res.status(404).json({
  success: true,
  msg: `The route you entered '${req.url}' doesn't exists`
})

export default notfound