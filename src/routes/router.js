// src/routes/router.js

import express from 'express';
import {
    gethistoryCustomer,
    searchCustomers,
    updateCustomer,
    historyCustomer,
    getAllCustomers,
    makeNewRecord,
    viewCustomer
} from '../controllers/customers.js';

import {
    loginCustomer, 
    logoutCustomer, 
    registerCustomer, 
    fetchCurrentUser 
} from '../controllers/sign.js';

import {
    addCustomField, 
    addCustomValues
} from '../controllers/custom.js';

import { uploadCustomerData } from '../controllers/uploadFile.js';
import { authenticateToken } from '../middlewares/auth.js';
import { makeAdminByUsername } from '../controllers/admin.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Route for user registration
router.post('/register', registerCustomer);

// Route for user login
router.post('/login', loginCustomer);

// Route for user logout
router.post('/logout', authenticateToken, logoutCustomer);

// Route to get latest 5 customers
router.get('/customers', getAllCustomers);

// Route to search customers
router.get('/customers/search', searchCustomers);

// Route to view customer details
router.get('/customer/details/C_unique_id', viewCustomer);

// Route to update a customer by ID
router.put('/customer/:id', updateCustomer);

// Route to post the updated history
router.post('/customers/log-change', historyCustomer);

// Route to see the updated history
router.get('/customers/log-change/:id', gethistoryCustomer);


// Route to create a new customer record
router.post('/customer/new', makeNewRecord);


// Route to add a custom field
router.post('/custom-fields', authenticateToken, addCustomField);


// Route to add custom values
router.post('/custom-values/:id', addCustomValues);

// Route for uploading customer data
router.post('/upload-customer-data', uploadCustomerData);  // New route for uploading customer data

// Route to fetch current user
router.get('/current-user', authenticateToken, fetchCurrentUser);

// Route for giving admin access
router.post('/promote-admin', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ success: false, message: "Username is required." });
    }

    const result = await makeAdminByUsername(username);
    return res.status(result.success ? 200 : 400).json(result);
});

export default router;
