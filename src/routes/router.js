// src/routes/router.js

import express from 'express';
import { gethistoryCustomer, searchCustomers, updateCustomer, historyCustomer, getAllCustomers } from '../controllers/customers.js';
import { loginCustomer, logoutCustomer, registerCustomer } from '../controllers/sign.js';
import { authenticateToken } from '../middlewares/auth.js';
import { makeAdminByUsername } from '../controllers/admin.js';

const router = express.Router();

// Route to get latest 5 customers
router.get('/customers', getAllCustomers);

// Route to search customers
router.get('/customers/search', searchCustomers); 

// Route to update a customer by ID
router.put('/customers/use/:id', updateCustomer);

// Route to post the updated history 
router.post('/customers/log-change', historyCustomer);

// Route to see the updated history 
router.get('/customers/log-change/:id', gethistoryCustomer);


// Route for user registration
router.post('/register', registerCustomer);

// Route for user login
router.post('/login', loginCustomer);

// Route for user logout
router.post('/logout', authenticateToken, logoutCustomer);

router.post('/promote-admin', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ success: false, message: "Username is required." });
    }

    const result = await makeAdminByUsername(username);
    return res.status(result.success ? 200 : 400).json(result);
});


export default router;
