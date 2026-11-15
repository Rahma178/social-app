
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
