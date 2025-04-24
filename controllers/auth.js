require('axios')
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require('../utils/database'); 
const { default: axios } = require("axios");
const { generateAccessToken } = require('./genTokens');


exports.googleAuth = async (req, res) => {
    const googleToken = req.headers.authorization?.split(' ')[1];
    if (!googleToken) {
        return res.status(400).json({ message: 'Access token is missing' });
    }

    try {
        // Fetch user info from Google using the access token
        const USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
        const { data: userInfo } = await axios.get(USER_INFO_URL, {
            headers: { Authorization: `Bearer ${googleToken}` },
        });
        console.log("User info data ", userInfo);

        // Extracting name and splitting into parts
        const fullName = userInfo.name || '';
        const nameParts = fullName.trim().split(" ");
        
        const firstName = nameParts[0] || "";
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
        
        // Destructuring other fields from userInfo
        const {
            email,
            email_verified: isEmailVerified,
        } = userInfo;
        
        if (!email) {
            return res.status(400).json({ message: 'User email is required' });
        }
        
        // Logging the extracted values
        console.log({ firstName, middleName, lastName, email, isEmailVerified });        

        // Check if the user exists in the database
        connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email],
            (error, results) => {
                if (error) {
                    console.error('Database query error:', error);
                    return res.status(500).json({ message: 'Database error' });
                }

                const userData = {
                    firstName: firstName,
                    middleName: middleName,
                    lastName: lastName,
                    email,
                    isEmailVerified: isEmailVerified ? 1 : 0,
                };

                if (results.length > 0) {
                    // User exists, update their information
                    const updateQuery = `
                        UPDATE users 
                        SET firstName = ?, middleName = ?, lastName = ?, isEmailVerified = ?, updatedAt = NOW()
                        WHERE email = ?
                    `;
                    connection.query(
                        updateQuery,
                        [firstName, middleName, lastName, isEmailVerified ? 1 : 0, email],
                        (updateError) => {
                            if (updateError) {
                                console.error('Error updating user:', updateError);
                                return res.status(500).json({ message: 'Failed to update user' });
                            }

                            console.log('User info updated:', results[0]);
                            // Generate JWT token
                            // const jwtToken = jwt.sign(
                            //     {
                            //         id: results[0].user_id,
                            //         email,
                            //     },
                            //     process.env.SECRET, // Replace with a secure secret key
                            //     { expiresIn: '7d' }
                            // );

                            const user = { id : results[0].user_id, email };
                            const accessToken = generateAccessToken(user);

                            return res.status(200).json({
                                token: accessToken,
                                user: {
                                    ...userData,
                                },
                            });
                        }
                    );
                } else {
                    // User does not exist, insert a new record
                    const insertQuery = `
                        INSERT INTO users (firstName, middleName, lastName, email, password, isEmailVerified, createdAt, updatedAt)
                        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                    `;
                    connection.query(
                        insertQuery,
                        [firstName, middleName, lastName, email, '', isEmailVerified ? 1 : 0],
                        (insertError, results) => {
                            if (insertError) {
                                console.error('Error inserting user:', insertError);
                                return res.status(500).json({ message: 'Failed to create user' });
                            }

                            // Generate JWT token
                            // const jwtToken = jwt.sign(
                            //     {
                            //         user_id: results.insertId,
                            //         email,
                            //     },
                            //     process.env.SECRET, 
                            //     { expiresIn: '7d' }
                            // );

                            const user = { id : results.insertId, email, firstName : results[0].firstName };
                            const accessToken = generateAccessToken(user);

                            return res.status(201).json({
                                token: accessToken,
                                
                                user: {
                                    // user_id: results.insertId,
                                    ...userData,
                                },
                            });
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error('Failed to fetch user info:', error.response?.data || error.message);
        res.status(401).json({ message: 'Failed to fetch user info', details: error.response?.data });
    }
};

//mobile google login
exports.googleUserData = (req, res) => {
    const userData = req.body;
    console.log('Received User Data:', JSON.stringify(userData));

    // Check if required fields exist
    if (!userData || !userData.email) {
        return res.status(400).json({ message: 'User email is required' });
    }

    // Extract user details
    const { name, email, isEmailVerified } = userData;
    const [firstName, lastName = ''] = name.split(' '); // Handles missing last name

    // Check if the user exists in the database
    connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ message: 'Database error' });
        }

        const userDataToSave = {
            name: firstName,
            lastname: lastName,
            email,
            role: 'user',
            password: '', // Empty password
            isEmailVerified: isEmailVerified ? 1 : 0, // Convert to 1 or 0 for consistency
        };

        console.log('User Data to Save:', JSON.stringify(userDataToSave));

        if (results.length > 0) {
            // User exists, update their information
            const updateQuery = `
                UPDATE users
                SET name = ?, lastname = ?, isEmailVerified = ?, updatedAt = NOW()
                WHERE email = ?
            `;
            connection.query(
                updateQuery,
                [firstName, lastName, userDataToSave.isEmailVerified, email],
                (updateError, updateResults) => {
                    if (updateError) {
                        console.error('Error updating user:', updateError);
                        return res.status(500).json({ message: 'Failed to update user' });
                    }

                    console.log('User updated:', updateResults);
                    return res.status(200).json({
                        message: 'User updated successfully',
                        user: {
                            id: results[0].id,
                            ...userDataToSave,
                            role: results[0].role,
                        },
                    });
                }
            );
        } else {
            // User does not exist, insert a new record
            const insertQuery = `
                INSERT INTO users (name, lastname, email, role, password, isEmailVerified, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
            connection.query(
                insertQuery,
                [firstName, lastName, email, userDataToSave.role, userDataToSave.password, userDataToSave.isEmailVerified],
                (insertError, insertResults) => {
                    if (insertError) {
                        console.error('Error inserting user:', insertError);
                        return res.status(500).json({ message: 'Failed to create user' });
                    }

                    console.log('User inserted:', insertResults);
                    return res.status(201).json({
                        message: 'User created successfully',
                        user: {
                            id: insertResults.insertId,
                            ...userDataToSave,
                        },
                    });
                }
            );
        }
    });
};



exports.deleteUser = async (req, res) => {
    const userId = req.user; // Assuming `req.user` contains the authenticated user ID
    const { password } = req.body;

    try {
        // Fetch user from the database by userId
        connection.query('SELECT * FROM users WHERE id = ?', [userId], async (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const user = results[0];

            // Compare provided password with the hashed password in the database
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            // Delete the user account
            connection.query('DELETE FROM users WHERE id = ?', [userId], (deleteErr) => {
                if (deleteErr) {
                    console.error('Database delete error:', deleteErr);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.status(200).json({ message: 'Account successfully deleted' });
            });
        }); 
    } catch (error) {
        console.error('Error during account deletion:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Signup Controller
// exports.signup = async (req, res) => {
//     const { firstName,middleName, lastName, email, password } = req.body;

//     try {
//         // Check if the user already exists
//         connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
//             if (err) {
//                 console.error('Database query error:', err);
//                 return res.status(500).json({ message: 'Server error' });
//             }

//             if (results.length > 0) {
//                 return res.status(400).json({ message: 'User already exists' });
//             }

//             // Hash the password
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(password, salt);

//             // Insert new user into the database
//             const query = 'INSERT INTO users (firstName, middleName, lastName, email, password) VALUES (?, ?, ?, ?, ?)';
//             connection.query(query, [firstName,middleName, lastName, email, hashedPassword], (insertErr, insertResults) => {
//                 if (insertErr) {
//                     console.error('Database insert error:', insertErr);
//                     return res.status(500).json({ message: 'Server error' });
//                 }

//                 const newUserId = insertResults.insertId;

//                 // Generate JWT token
//                 const token = jwt.sign({ user_id: newUserId }, process.env.SECRET, { expiresIn: '7d' });

//                 // Return token and user info
//                 res.status(201).json({
//                     token,
//                     user: { user_id: newUserId, firstName, middleName, lastName, email },
//                 });
//             });
//         });
//     } catch (err) {
//         console.error('Error during signup:', err);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

//     // Login Controller
// exports.login = async (req, res) => {
//     const { email, password } = req.body;
    
//     try {
//         // Find user by email using a raw SQL query
//         connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
//             if (error) {
//                 return res.status(500).json({ message: 'Please Check the database connections' });
//             }

//             // Check if user exists
//             if (results.length === 0) {
//                 return res.status(404).json({ message: 'User not found' });
//             }

//             const user = results[0]; // Get the user from the query result
//             console.log(user);
//             // Compare the provided password with the stored hashed password
//             const isMatch = await bcrypt.compare(password, user.password);
//             if (!isMatch) {
//                 return res.status(400).json({ message: 'Invalid credentials' });
//             }
    
//             // Generate JWT token
//             const token = jwt.sign({ user_id: user.user_id }, process.env.SECRET, { expiresIn: '7d' });

//             // Return the token and user information
//             res.json({
//                 token,
//                 user: { user_id: user.user_id, firstName: user.firstName,lastName: user.lastName, email: user.email },
//                 // expiresIn: 3600
//             });
//         });
//     } catch (err) {
    //         res.status(500).json({ message: 'Server error' });
    //     }
    // };
    
    
