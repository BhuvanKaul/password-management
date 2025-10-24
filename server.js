import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { addUser, getPassword } from './database.js';

dotenv.config();

const app = express();
const port = 3000;
app.use(express.json());

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const saltRounds = 10;


app.post('/register', async(req, res)=>{
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string'){
        return res.status(400).json({error: "Invalid Input Type"});
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try{
        await addUser(email, hashedPassword);
        res.status(201).json({message: "User registered successfully"});

    } catch(err) {
        if (err.message === 'Email already exists'){
            res.status(409).json({error: err.message});

        } else {
            res.status(500).json({error: "Internal Server Error"});
        }
    }
});


app.post('/login', async(req, res)=>{
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string'){
        return res.status(400).json({error: "Invalid Input Type"});
    }

    try{
        const actualHashedPassword = await getPassword(email);
        const isCorrectPassword = await bcrypt.compare(password, actualHashedPassword);

        if (isCorrectPassword) {
            const payload = { email: email }
            const token = jwt.sign(payload, jwtSecretKey, {expiresIn: '1h'});
            res.status(201).json({ message: "Login Successful", token });

        } else{
            res.status(401).json( {error: "Invalid Passoword"} )
        }

    } catch(err){

        if (err.message === 'User not Found'){
            res.status(404).json({error: err.message});

        } else{
            res.status(500).json({error: "Internal Server Error"});
        }
    }
});

app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
});