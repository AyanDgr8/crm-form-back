// src/routes/router.js

import express from 'express';
import { gethistoryCustomer, searchCustomers, updateCustomer, historyCustomer, getAllCustomers } from '../controllers/customers.js';

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

// Route to delete a customer by ID
// router.delete('/customers/:id', deleteCustomer);

// // Route to implement customer 
// router.post('/customers/upload', )

export default router;
