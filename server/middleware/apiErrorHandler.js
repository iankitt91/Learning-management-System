const apiErrorHandler = (anyFunc) => async (req,res,next) =>{
    return Promise.resolve(anyFunc(req,res,next)).catch((err) => next(err));
}

export default apiErrorHandler;