import {Pool} from 'pg';
import dotenv from 'dotenv';
dotenv.config();


const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
})


export const addUser = async(email, hashedPassword)=>{
    const query = 'insert into user_passwords values($1, $2);';

    try{
        await pool.query(query, [email, hashedPassword]);

    } catch(err){

        if (err.code === '23505'){
            throw new Error('Email already exists');

        } else {
            console.error(err);
            throw err;
        }
    }
};


export const getPassword = async(email) => {
    const query = 'select password from user_passwords where email = $1;';

    try{
        const result = await pool.query(query, [email]);
        if (result.rowCount === 0){
            throw new Error('User not Found');
        }

        return result.rows[0].password;

    } catch(err){

        if (err.message === 'User not Found'){
            throw err;

        } else {
            console.error(err);
            throw err;
        }
    }
};
