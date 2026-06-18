import "dotenv/config";
import connectDB from "./config/db.js";
import jwt from "jsonwebtoken";
import { User } from "./models/user.model.js";

async function run() {
    try {
        await connectDB();
        const user = await User.findOne();
        if (!user) {
            console.error("No user found in DB.");
            process.exit(1);
        }
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        console.log(`Generated token for user ${user._id}`);
        
        const res = await fetch("http://localhost:5000/api/sessions/my-sessions", {
            headers: {
                "Cookie": `jwt=${token}`
            }
        });
        
        const status = res.status;
        const text = await res.text();
        console.log(`Status: ${status}`);
        console.log(`Response: ${text.substring(0, 500)}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
