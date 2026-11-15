import mongoose from "mongoose"
import { DB_URI } from "../config/config.service";

const ConnectionDB = async () => {
    await mongoose.connect(DB_URI)
        .then(() => {
            console.log("DB connected successfully");
        })
        .catch((err: any) => {
            console.log("DB connected failed");
        })
}

export default ConnectionDB