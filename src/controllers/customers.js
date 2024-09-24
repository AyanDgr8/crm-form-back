// src/controllers/customers.js

import connectDB from '../db/index.js';  

export const searchCustomers = async (req, res) => {
  const { query } = req.query;

  try {
      const connection = await connectDB(); // Connect to the database
      let results;

      // Search across multiple fields: first_name, last_name, phone_no, email_id, C_unique_id
      const sql = `
          SELECT * FROM customers 
          WHERE first_name LIKE ? 
          OR last_name LIKE ? 
          OR phone_no LIKE ?
          OR email_id LIKE ?
          OR C_unique_id LIKE ?
          OR agent_name LIKE ?
          OR address LIKE ?
          OR contact_type LIKE ?
          OR company_name LIKE ?
          OR disposition LIKE ?
      `;
      
      const searchParam = `%${query}%`;
      const [rows] = await connection.execute(sql, [
          searchParam,  
          searchParam,  
          searchParam,  
          searchParam,  
          searchParam,  
          searchParam,  
          searchParam,   
          searchParam,  
          searchParam,  
          searchParam   
      ]);

      results = rows;

      res.status(200).json(results);
  } catch (error) {
      console.error('Error searching customers:', error);
      res.status(500).json({ message: 'Failed to search customers' });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
      const connection = await connectDB();
      const query = `SELECT * FROM customers ORDER BY last_updated DESC`;  
      const [rows] = await connection.execute(query);
      
      res.status(200).json(rows);
  } catch (error) {
      console.error('Error fetching last updated customers:', error);
      res.status(500).json({ message: 'Failed to fetch records' });
  }
};


export const getLastUpdatedCustomers = async (req, res) => {
    try {
        const connection = await connectDB();
        const query = `SELECT * FROM customers ORDER BY last_updated DESC LIMIT 5`;  
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
  