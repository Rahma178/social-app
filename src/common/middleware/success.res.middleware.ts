import { Request, Response, NextFunction } from "express";

// عشان TypeScript يعرف إن res فيها success
declare global {
  namespace Express {
    interface Response {
      success: (options?: {
        statusCode?: number;
        message?: string;
        data?: any;
      }) => Response;
    }
  }
}

// 1) middleware بيضيف res.success
export const success_response = (req: Request,res: Response,next: NextFunction
) => {
  res.success = ({ statusCode = 200, message = "Done", data = undefined } = {}) => {
    return res.status(statusCode).json({ message, data });
  };
  next();
};

// 2) middleware بيتحط في الآخر: لو محدش رد، يبعت success تلقائي
export const default_success = (req: Request,res: Response,next: NextFunction
) => {
  if (!res.headersSent) {
    return res.success();
  }
};