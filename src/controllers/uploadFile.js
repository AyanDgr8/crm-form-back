// src/controllers/uploadFile.js

import connectDB from '../db/index.js'; 

// Function to format date to YYYY-MM-DD
const formatDate = (date) => {
    if (!date) return null; // Return null for undefined or empty date
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]; // Format to YYYY-MM-DD
};

export const uploadCustomerData = async (req, res) => {
    try {
        const customerData = req.body.customers; // Assume an array of customer objects is sent in request body

        console.log('Received customer data:', customerData); // Log input data

        if (!Array.isArray(customerData) || customerData.length <= 1) {
            return res.status(400).json({ message: 'No customer data provided' });
        }

        // Skip the header row (first row) and process the rest
        const dataRows = customerData.slice(0); // Skip the first row (header)

        const connection = await connectDB(); // Connect to the database

        // Defined columns that we expect in the database
        const definedColumns = [
            "first_name", "last_name", "phone_no", "email_id", 
            "date_of_birth", "address", "company_name", "C_unique_id", 
            "contact_type", "source", "disposition", "agent_name", "date_created"
        ];

        const values = dataRows.map(customer => {
          return definedColumns.map(column => {
              switch (column) {
                  case 'date_of_birth':
                      return formatDate(customer.date_of_birth); // Access directly by property name
                  case 'date_created':
                      const formattedDateCreated = formatDate(customer.date_created);
                      return formattedDateCreated || new Date().toISOString().split('T')[0]; // Use current date if invalid
                  default:
                      return customer[column] || null; // Access directly by property name
              }
          });
      });

        console.log('Final values for insertion:', values); // Log values before insertion

        const columnsToInsert = definedColumns.join(', ');
        const placeholders = definedColumns.map(() => '?').join(', ');

        // Construct the bulk insert query
        const query = `
            INSERT INTO customers (${columnsToInsert}) 
            VALUES ${values.map(() => `(${placeholders})`).join(', ')}
        `;

        // Flatten the array of values for the query
        const flatValues = values.flat();

        await connection.execute(query, flatValues);

        res.status(200).json({ message: 'Customers data updated successfully!' });
    } catch (error) {
        console.error('Error updating customer data:', error);
        res.status(500).json({ message: 'Failed to update customer data' });
    }
};