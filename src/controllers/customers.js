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
      const query = `SELECT * FROM customers ORDER BY date_created DESC LIMIT 5`;  // Fetch the last 5 records based on creation date
      const [rows] = await connection.execute(query);
  
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching last updated customers:', error);
      res.status(500).json({ message: 'Failed to fetch records' });
    }
  };
  

// export const createCustomer = async (req, res) => {
//   const { first_name, last_name, phone_no, email_id, date_of_birth, address, company_name, contact_type, source, disposition, agent_name } = req.body;

//   try {
//     const connection = await connectDB();  // Connect to the database
//     const query = `INSERT INTO customers (first_name, last_name, phone_no, email_id, date_of_birth, address, company_name, contact_type, source, disposition, agent_name)
//                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     const [result] = await connection.execute(query, [first_name, last_name, phone_no, email_id, date_of_birth, address, company_name, contact_type, source, disposition, agent_name]);

//     res.status(201).json({ message: 'Customer created successfully!', customerId: result.insertId });
//   } catch (error) {
//     console.error('Error creating customer:', error);
//     res.status(500).json({ message: 'Failed to create customer' });
//   }
// };


// export const getCustomers = async (req, res) => {
//     try {
//       const connection = await connectDB();  // Connect to the database
//       const query = 'SELECT * FROM customers';
  
//       const [rows] = await connection.execute(query);
  
//       res.status(200).json(rows);
//     } catch (error) {
//       console.error('Error fetching customers:', error);
//       res.status(500).json({ message: 'Failed to fetch customers' });
//     }
//   };
  


export const updateCustomer = async (req, res) => {
    const customerId = req.params.id;
    const { first_name, last_name, phone_no, email_id, date_of_birth, address, company_name, contact_type, source, disposition, agent_name } = req.body;
  
    try {
      const connection = await connectDB();  // Connect to the database
      const query = `UPDATE customers SET first_name = ?, last_name = ?, phone_no = ?, email_id = ?, date_of_birth = ?, address = ?, company_name = ?, contact_type = ?, source = ?, disposition = ?, agent_name = ?
                     WHERE id = ?`;
  
      const [result] = await connection.execute(query, [first_name, last_name, phone_no, email_id, date_of_birth, address, company_name, contact_type, source, disposition, agent_name, customerId]);
  
      res.status(200).json({ message: 'Customer updated successfully!' });
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({ message: 'Failed to update customer' });
    }
  };
  


export const deleteCustomer = async (req, res) => {
    const customerId = req.params.id;
  
    try {
      const connection = await connectDB();  // Connect to the database
      const query = `DELETE FROM customers WHERE id = ?`;
  
      await connection.execute(query, [customerId]);
  
      res.status(200).json({ message: 'Customer deleted successfully!' });
    } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json({ message: 'Failed to delete customer' });
    }
  };
  