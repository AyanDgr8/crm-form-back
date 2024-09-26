// src/controllers/sign.js

import bcrypt from 'bcrypt'; 
import connectDB from '../db/index.js';  
import jwt from 'jsonwebtoken'; 
import dotenv from "dotenv";

dotenv.config();  // Load environment variables

// Register User (without role)
export const registerCustomer = async (req, res) => {
    const { username, email, password } = req.body; 

    try {
        const connection = await connectDB();
        
        // Check if the user already exists
        const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the 'users' table
        const [result] = await connection.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Send success response
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login User
export const loginCustomer = async (req, res) => {
    const { email, password } = req.body; 

    try {
        const connection = await connectDB();

        // Check if the user exists
        const [user] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(password, user[0].password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Log the login time in 'login_history' table
        await connection.query('INSERT INTO login_history (user_id, login_time) VALUES (?, NOW())', [user[0].id]);

        // Generate JWT
        const token = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET, {
            expiresIn: '12h',  // Token expiration time
        });

        // Send success response with token
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout User
export const logoutCustomer = async (req, res) => {
    const userId = req.user.userId;  // Assuming you have middleware that attaches user info to req

    try {
        const connection = await connectDB();

        // Update the logout_time for the user's latest login record
        await connection.query(
            'UPDATE login_history SET logout_time = NOW() WHERE user_id = ? AND logout_time IS NULL',
            [userId]
        );

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
