import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db from "../db.js"

const router = express.Router()

router.post('/register', (req, res) => {
    const {username, password} = req.body
    // encrypt the password 
    const hashedPassword = bcrypt.hashSync(password, 8)
    
    // save the new user in db
    try {
        const insertUser = db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`)
        const result = insertUser.run(username, hashedPassword)

        // default todo
        const defaultTodo = 'Hello :) Write your first TODO'
        const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`)
        insertTodo.run(result.lastInsertRowid, defaultTodo)

        //create a token
        const token = jwt.sign({id: result.lastInsertRowid}, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({token})
    }   catch(err) {
        console.log(err.message)
        res.sendStatus(503)
    } 

})

router.post('/login', (req, res) => {

    const {username, password} = req.body
    
    try {
        const getUser = db.prepare(`SELECT * FROM users WHERE username = ?`)
        const user = getUser.get(username)
        // if user not found send back the error message
        if(!user) { return res.status(404).send({message: "User Not Found"}) }

        const passswordIsValid = bcrypt.compareSync(password, user.password)
        // if password not found then send error message
        if(!passswordIsValid) { return res.status(401).send({ message: "You aren't getting away it that"}) }
        console.log(user)
        
        // authentication successfull
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h'})
        res.json({token})
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

export default router