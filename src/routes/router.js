// src/routes/router.js

import express from 'express';
import {
    gethistoryCustomer,
    searchCustomers,
    updateCustomer,
    historyCustomer,
    getAllCustomers,
    getCustomFieldsByCustomerId, 
} from '../controllers/customers.js';
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

// Route for giving admin access
router.post('/promote-admin', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ success: false, message: "Username is required." });
    }

    const result = await makeAdminByUsername(username);
    return res.status(result.success ? 200 : 400).json(result);
});

// Route for getting custom fields for a specific customer
router.get('/customers/custom-fields/:id', async (req, res) => {
    const userId = req.params.id; // Changed from customerId to userId

    try {
        const customFields = await getCustomFieldsByCustomerId(userId); // Use userId to fetch custom fields
        if (customFields && customFields.length > 0) { // Check for the existence of custom fields
            return res.status(200).json({ success: true, data: customFields }); // Return success response with data
        } else {
            return res.status(404).json({ success: false, message: "No custom fields found." });
        }
    } catch (error) {
        console.error("Error fetching custom fields:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});


export default router;
