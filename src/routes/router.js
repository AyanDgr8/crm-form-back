// src/routes/router.js

import express from 'express';
import { getLastUpdatedCustomers, searchCustomers, updateCustomer, deleteCustomer } from '../controllers/customers.js';

const router = express.Router();

// Route to get latest 5 customers
router.get('/customers', getLastUpdatedCustomers);

// Route to search customers
router.get('/customers/search', searchCustomers); 

// Route to update a customer by ID
router.put('/customers/:id', updateCustomer);

// Route to delete a customer by ID
router.delete('/customers/:id', deleteCustomer);

export default router;
