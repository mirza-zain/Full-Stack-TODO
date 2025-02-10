import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db from "../db.js"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

const router = express.Router()

router.post('/register', (req, res) => {
    const { username, password } = req.body
    console.log(`Registering user: ${username}`)

    // encrypt the password 
    const hashedPassword = bcrypt.hashSync(password, 8)
    console.log(`Hashed password: ${hashedPassword}`)

    // save the new user in db
    try {
        const insertUser = db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`)
        const result = insertUser.run(username, hashedPassword)
        console.log(`User inserted with ID: ${result.lastInsertRowid}`)

        // default todo
        const defaultTodo = 'Hello :) Write your first TODO'
        const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`)
        insertTodo.run(result.lastInsertRowid, defaultTodo)
        console.log(`Default todo inserted for user ID: ${result.lastInsertRowid}`)

        // create a token
        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRET, { expiresIn: '24h' })
        console.log(`Token created: ${token}`)
        res.json({ token })
    } catch (err) {
        console.log(`Error during registration: ${err.message}`)
        res.sendStatus(503)
    }
})

router.post('/login', (req, res) => {
    const { username, password } = req.body
    console.log(`Logging in user: ${username}`)

    try {
        const getUser = db.prepare(`SELECT * FROM users WHERE username = ?`)
        const user = getUser.get(username)
        // if user not found send back the error message
        if (!user) {
            console.log(`User not found: ${username}`)
            return res.status(404).send({ message: "User Not Found" })
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password)
        // if password not found then send error message
        if (!passwordIsValid) {
            console.log(`Invalid password for user: ${username}`)
            return res.status(401).send({ message: "You aren't getting away with that" })
        }
        console.log(`User authenticated: ${username}`)

        // authentication successful
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        console.log(`Token created: ${token}`)
        res.json({ token })
    } catch (err) {
        console.log(`Error during login: ${err.message}`)
        res.sendStatus(503)
    }
})

export default router