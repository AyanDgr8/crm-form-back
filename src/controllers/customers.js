// src/controllers/customers.js

import connectDB from '../db/index.js';  

export const searchCustomers = async (req, res) => {
    const { type, query } = req.query;

    try {
        const connection = await connectDB(); // Connect to the database
        let results;

        if (type === 'name') {
            // Search by first name or last name
            const sql = 'SELECT * FROM customers WHERE first_name LIKE ? OR last_name LIKE ?';
            const [rows] = await connection.execute(sql, [`%${query}%`, `%${query}%`]);
            results = rows;
        } else if (type === 'phone') {
            // Search by phone number
            const sql = 'SELECT * FROM customers WHERE phone_no = ?';
            const [rows] = await connection.execute(sql, [query]);
            results = rows;
        } else if (type === 'email') {
            // Search by email
            const sql = 'SELECT * FROM customers WHERE email_id = ?';
            const [rows] = await connection.execute(sql, [query]);
            results = rows;
        } else if (type === 'unique_id') {
          // Search by email
          const sql = 'SELECT * FROM customers WHERE C_unique_id = ?';
          const [rows] = await connection.execute(sql, [query]);
          results = rows;
        } else {
            return res.status(400).json({ message: 'Invalid search type' });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error('Error searching customers:', error);
        res.status(500).json({ message: 'Failed to search customers' });
    }
};

export const getLastUpdatedCustomers = async (req, res) => {
    try {
        const connection = await connectDB();
        const query = `SELECT * FROM customers ORDER BY last_updated DESC LIMIT 5`;  // Fetch the last 5 records based on last updated date
        const [rows] = await connection.execute(query);
        
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching last updated customers:', error);
        res.status(500).json({ message: 'Failed to fetch records' });
    }
};


export const updateCustomer = async (req, res) => {
    const customerId = req.params.id;
    const { first_name, last_name, 
      phone_no, email_id, date_of_birth, 
      address, company_name, contact_type, 
      source, disposition, agent_name } = req.body;
  
    try {
      const connection = await connectDB(); 

      // Format the date_of_birth to 'YYYY-MM-DD' if it exists
      const formattedDOB = date_of_birth ? new Date(date_of_birth).toISOString().split('T')[0] : null;
  
      const query = `
        UPDATE customers 
        SET first_name = ?, last_name = ?, 
            phone_no = ?, email_id = ?, 
            date_of_birth = ?, address = ?, 
            company_name = ?, contact_type = ?, 
            source = ?, disposition = ?, 
            agent_name = ? 
        WHERE id = ?`;

      // Ensure undefined values are converted to null before executing the query
      const params = [
        first_name || null,
        last_name || null,
        phone_no || null,
        email_id || null,
        formattedDOB || null,
        address || null,
        company_name || null,
        contact_type || null,
        source || null,
        disposition || null,
        agent_name || null,
        customerId,
      ];

      // Execute the query with sanitized parameters
      const [result] = await connection.execute(query, params);
  
      res.status(200).json({ message: 'Customer updated successfully!' });
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({ message: 'Failed to update customer' });
    }
  };
  
