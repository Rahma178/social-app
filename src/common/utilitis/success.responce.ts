

// import type { NextFunction, Request, Response } from "express";


// export const successResponse = (fn: Function) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const { message = "done", data = undefined, statusCode = 200 } = await fn(req, res, next);
//     if (res.headersSent) return;
//     return res.status(statusCode).json({ message, data });
//   };
// };



import { Response } from "express";

interface SuccessResponseParams {
    res: Response;
    statusCode?: number;
    message?: string;
    data?: any;
}

export const success_response = ({
    res,
    statusCode,
    message = "Done",
    data = undefined
}: SuccessResponseParams) => {
    return res.status(statusCode || 200).json({ message, data });
};
