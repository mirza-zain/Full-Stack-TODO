import jwt from "jsonwebtoken"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

function authMiddleware (req, res, next) {
    const token = req.headers['authorization']

    if(!token) { return res.status(401).json({ message: "No Token provided"}) }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) { return res.status(401).json({ message: "Invlid Token"}) }

        req.userId = decoded.id
        next()
    })
}

export default authMiddleware