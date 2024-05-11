import {ApiError} from "./ApiError.js"

//errorHandler 
const errorHandler = (err, req, res, next) => {
  console.log(err)
  //checking whether the error is custom error or not
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }

  //sending the default message
  return res
    .status(500)
    .json({ msg: "Something went wrong! , please try again" ,err});
};

//export of errorHandler 
export default errorHandler