// const connection = require("../utils/database");
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');

// // Get Recent Users
// exports.getRecentUsers = async (req, res) => {
//   try {
//     const query = `
//       SELECT firstName, email 
//       FROM users
//       ORDER BY createdAt DESC 
//       LIMIT 5;
//     `;

//     connection.query(query, (err, results) => {
//       if (err) {
//         console.error('Error fetching recent users:', err);
//         return res.status(500).json({ message: "Server error" });
//       }
//       res.json(results);
//     });
//   } catch (err) {   
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Get User Profile
// exports.getUserProfile = async (req, res) => {
//   try {
//     const email = req.user.email;

//     console.log("32 email ", email);

//     const query = `
//       SELECT user_id, userName, firstName, middleName, lastName, email, mobile, gender, dob, isEmailVerified, isMobileVerified, martialStatus as maritalStatus
//       FROM users 
//       WHERE email = ?;
//     `;

//     connection.query(query, [email], (err, results) => {
//       if (err) {
//         console.error('Error fetching user profile:', err);
//         return res.status(500).json({ message: "Internal server error" });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({ message: "User not found" });
//       }
//       console.log("47 from user controller ", results[0]);


//       res.status(200).json(results[0]);
//     });
//   } catch (error) {
//     console.error('Error in getUserProfile:', error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
// // Edit User Profile
// exports.editUserProfile = async (req, res) => {
//   console.log(res);

//   console.log("59 req data ", req.body);
//   try {
//     let { firstName, middleName, lastName, mobile, dob, gender, email, maritalStatus } = req.body;

//     // Switch for marital status: 's' for single, 'm' for married
//     let maritalStatusValue;
//     switch (maritalStatus) {
//       case 's':
//         maritalStatusValue = 'single';
//         break;
//       case 'm':
//         maritalStatusValue = 'married';
//         break;
//       default:
//         maritalStatusValue = maritalStatus; // Keep original value if not 's' or 'm'
//     }

//     // Switch for gender: 'Male' -> 'M', 'Female' -> 'F'
//     let genderValue;
//     switch (gender?.toLowerCase()) {
//       case 'male':
//         genderValue = 'M';
//         break;
//       case 'female':
//         genderValue = 'F';
//         break;
//       default:
//         genderValue = gender; // Keep original value if not 'Male' or 'Female'
//     }

//     console.log("60 maritalStatus ", maritalStatusValue);
//     console.log("60 gender ", genderValue);

//     // Check if maritalStatus is provided, if not, exclude it from the update
//     let updateQuery, queryParams;

//     if (maritalStatusValue !== undefined && maritalStatusValue !== null && maritalStatusValue !== '') {
//       updateQuery = `
//         UPDATE users 
//         SET firstName = ?, middleName = ?, lastName = ?, mobile = ?, dob = ?, gender = ?, email = ?, martialStatus = ? 
//         WHERE user_id = ?;
//       `;
//       queryParams = [firstName, middleName, lastName, mobile, dob, genderValue, email, maritalStatusValue, req.user];
//     } else {
//       updateQuery = `
//         UPDATE users 
//         SET firstName = ?, middleName = ?, lastName = ?, mobile = ?, dob = ?, gender = ?, email = ? 
//         WHERE user_id = ?;
//       `;
//       queryParams = [firstName, middleName, lastName, mobile, dob, genderValue, email, req.user];
//     }

//     // Update the user profile
//     connection.query(updateQuery, queryParams, (err, result) => {
//       if (err) {
//         console.error('Error updating user profile:', err);
//         return res.status(500).json({ message: "Internal server error" });
//       }

//       // Fetch the updated user profile
//       const fetchQuery = `SELECT firstName, middleName, lastName, email, mobile, gender, dob, isEmailVerified, isMobileVerified, martialStatus as maritalStatus, DATE_FORMAT(dob, '%Y-%m-%d') AS dob FROM users WHERE user_id = ?;`;
//       connection.query(fetchQuery, [req.user], (err, rows) => {
//         if (err) {
//           console.error('Error fetching updated user profile:', err);
//           return res.status(500).json({ message: "Internal server error" });
//         }

//         if (rows.length > 0) {
//           // Send the updated user data as an object
//           console.log("Sending data is ", rows[0]);
//           user = rows[0]
//           res.status(200).json({
//             ...user,
//             message : "Profile Edited Sucessfully"
//           });
//         } else {
//           res.status(404).json({ message: "User not found" });
//         }
//       });
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


// // My Bookings
// exports.myBookings = async (req, res) => {
//   try {
//     const userId = req.user;
//     const query = `
//       SELECT 
//         u.id AS user_id, u.name AS user_name, u.email AS user_email,
//         b.id AS booking_id, b.departure_date, b.arrival_date, b.status,
//         t.name AS train_name, fs.name AS from_station, ts.name AS to_station,
//         r.departure_time AS departure_time, r.arrival_time AS arrival_time
//       FROM 
//         users u
//         JOIN Bookings b ON u.id = b.UserId
//         JOIN Trains t ON b.TrainId = t.id
//         JOIN Stations fs ON b.from_station_id = fs.id
//         JOIN Stations ts ON b.to_station_id = ts.id
//         JOIN Routes r ON t.id = r.StationId
//       WHERE 
//         u.id = ?;
//     `;

//     connection.query(query, [userId], (err, bookings) => {
//       if (err) {
//         console.error('Error fetching booking details:', err);
//         return res.status(500).json({ error: "Internal Server Error" });
//       }

//       res.status(200).json({ bookings });
//     });
//   } catch (error) {
//     console.error("Error fetching booking details:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Add Traveller
// exports.addTraveller = async (req, res) => {
//   console.log("Passenger API triggered..");
//   const user_id = req.user;

//   try {
//     const {
//       passengerId, // Receiving passengerId in request
//       passengerName,
//       passengerAge,
//       passengerGender,
//       passengerBerthChoice,
//       passengerFoodChoice,
//       passengerBedrollChoice,
//       passengerConcession,
//       concessionOpted,
//       passengerIcardFlag,
//       passengerCardType,
//       passengerCardNumber,
//       bookingStatusIndex,
//       bookingStatus,
//       bookingCoachId,
//       bookingBerthNo,
//       bookingBerthCode,
//       currentStatusIndex,
//       currentStatus,
//       currentCoachId,
//       currentBerthNo,
//       currentBerthCode,
//       passengerNetFare,
//       currentBerthChoice,
//       childBerthFlag,
//       passengerNationality,
//       insuranceIssued,
//       policyNumber,
//       forGoConcessionOpted,
//     } = req.body;

//     if (passengerId) {
//       // ✅ UPDATE Passenger if passengerId exists
//       const updateFields = [];
//       const values = [];

//       const fieldsToUpdate = {
//         passengerName,
//         passengerAge,
//         passengerGender,
//         passengerBerthChoice,
//         passengerFoodChoice,
//         passengerBedrollChoice,
//         passengerConcession,
//         concessionOpted,
//         passengerIcardFlag,
//         passengerCardType,
//         passengerCardNumber,
//         bookingStatusIndex,
//         bookingStatus,
//         bookingCoachId,
//         bookingBerthNo,
//         bookingBerthCode,
//         currentStatusIndex,
//         currentStatus,
//         currentCoachId,
//         currentBerthNo,
//         currentBerthCode,
//         passengerNetFare,
//         currentBerthChoice,
//         childBerthFlag,
//         passengerNationality,
//         insuranceIssued,
//         policyNumber,
//         forGoConcessionOpted,
//       };

//       Object.entries(fieldsToUpdate).forEach(([key, value]) => {
//         if (value !== undefined) {
//           updateFields.push(`${key} = ?`);
//           values.push(value);
//         }
//       });

//       if (updateFields.length > 0) {
//         const updateQuery = `UPDATE passengers SET ${updateFields.join(", ")} WHERE passengerId = ?`;
//         values.push(passengerId);

//         connection.query(updateQuery, values, (updateErr, updateResults) => {
//           if (updateErr) {
//             console.error("Error updating passenger:", updateErr);
//             return res.status(500).json({ message: "Database error", error: updateErr.message });
//           }
//           return res.status(200).json({ message: "Passenger updated successfully" });
//         });
//       } else {
//         return res.status(200).json({ message: "No new data to update" });
//       }

//     } else {
//       // ✅ INSERT New Passenger if passengerId does not exist
//       const insertQuery = `
//         INSERT INTO passengers (
//           user_id, passengerName, passengerAge, passengerGender, 
//           passengerBerthChoice, passengerFoodChoice, passengerBedrollChoice, 
//           passengerConcession, concessionOpted, passengerIcardFlag, 
//           passengerCardType, passengerCardNumber, bookingStatusIndex, 
//           bookingStatus, bookingCoachId, bookingBerthNo, bookingBerthCode, 
//           currentStatusIndex, currentStatus, currentCoachId, currentBerthNo, 
//           currentBerthCode, passengerNetFare, currentBerthChoice, childBerthFlag, 
//           passengerNationality, insuranceIssued, policyNumber, forGoConcessionOpted
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;

//       const values = [
//         user_id, passengerName, passengerAge, passengerGender,
//         passengerBerthChoice, passengerFoodChoice, passengerBedrollChoice,
//         passengerConcession, concessionOpted, passengerIcardFlag,
//         passengerCardType, passengerCardNumber, bookingStatusIndex,
//         bookingStatus, bookingCoachId, bookingBerthNo, bookingBerthCode,
//         currentStatusIndex, currentStatus, currentCoachId, currentBerthNo,
//         currentBerthCode, passengerNetFare, currentBerthChoice, childBerthFlag,
//         passengerNationality, insuranceIssued, policyNumber, forGoConcessionOpted
//       ];

//       connection.query(insertQuery, values, (insertErr, insertResults) => {
//         if (insertErr) {
//           console.error("Error adding passenger:", insertErr);
//           return res.status(500).json({ message: "Database error", error: insertErr.message });
//         }
//         return res.status(201).json({ message: "Passenger added successfully", passengerId: insertResults.insertId });
//       });
//     }

//   } catch (error) {
//     console.error("Error details:", error);
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };



// // Get Travellers
// exports.getTravelers = async (req, res) => {
//   try {
//     const userId = req.user;

//     const query = `
//       SELECT *
//       FROM passengers 
//       WHERE user_id = ?;
//     `;

//     connection.query(query, [userId], (err, travelers) => {
//       if (err) {
//         console.error('Error fetching travelers:', err);
//         return res.status(500).json({ message: "Internal server error" });
//       }
//       console.log("Travelers are ", travelers);
//       res.status(200).json(travelers);
//     });
//   } catch (error) {
//     console.error("Error fetching travelers:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // Remove Traveller
// exports.removeTraveller = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user;

//     if (!id || !userId) {
//       return res.status(400).json({ message: "Please provide a valid traveller id and user id" });
//     }

//     const query = `
//       DELETE FROM passengers 
//       WHERE passengerId = ? AND user_id = ?;
//     `;

//     connection.query(query, [id, userId], (err, result) => {
//       if (err) {
//         console.error('Error removing traveler:', err);
//         return res.status(500).json({ message: "Internal server error" });
//       }

//       res.status(200).json({ message: "Traveller removed successfully" });
//     });
//   } catch (error) {
//     console.error("Error removing traveler:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };



// // API Function
// exports.imageUpload = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     if (!req.file || !req.file.path) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }
//     const imageUrl = req.file.path; // Cloudinary URL
//     // Save to DB using promise wrapper
//     await connection.promise().query('UPDATE users SET img_url = ? WHERE user_id = ?', [imageUrl, userId]);
//     res.status(200).json({ img_url: imageUrl, message: 'Image uploaded successfully' });
//   } catch (error) {
//     console.error('Image upload error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };



const connection = require("../utils/database");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Get Recent Users
exports.getRecentUsers = async (req, res) => {
  try {
    const query = `
      SELECT firstName, email 
      FROM users
      ORDER BY createdAt DESC 
      LIMIT 5;
    `;
    connection.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }
      res.json(results);
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const email = req.user.email;

    const query = `
      SELECT user_id, userName, firstName, middleName, lastName, email, mobile, gender, dob, 
             isEmailVerified, isMobileVerified, martialStatus as maritalStatus
      FROM users 
      WHERE email = ?;
    `;

    connection.query(query, [email], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Edit User Profile
exports.editUserProfile = async (req, res) => {
  console.log("59 req data ", req.body);
  try {
    let { firstName, middleName, lastName, mobile, dob, gender, email, maritalStatus } = req.body;

    let maritalStatusValue = null;

    if (maritalStatus) {
      switch (maritalStatus.toLowerCase()) {
        case 'single':
        case 'unmarried':
        case 'u':
          maritalStatusValue = 'U';
          break;
        case 'married':
        case 'm':
          maritalStatusValue = 'M';
          break;
        default:
          maritalStatusValue = null;
      }
    }

    let genderValue;
    switch (gender?.toLowerCase()) {
      case 'male':
        genderValue = 'M';
        break;
      case 'female':
        genderValue = 'F';
        break;
      default:
        genderValue = gender;
    }

    const getUserQuery = `SELECT user_id FROM users WHERE email = ?`;

    connection.query(getUserQuery, [req.user.email], (err, userResult) => {
      if (err) return res.status(500).json({ message: "Internal server error" });
      if (userResult.length === 0) return res.status(404).json({ message: "User not found" });

      const userId = userResult[0].user_id;

      let updateFields = [
        'firstName = ?', 'middleName = ?', 'lastName = ?',
        'mobile = ?', 'dob = ?', 'gender = ?', 'email = ?'
      ];
      let queryParams = [firstName, middleName, lastName, mobile, dob, genderValue, email];

      if (maritalStatusValue === 'M' || maritalStatusValue === 'U') {
        updateFields.push('martialStatus = ?');
        queryParams.push(maritalStatusValue);
      }

      queryParams.push(userId);

      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE user_id = ?;
      `;

      connection.query(updateQuery, queryParams, (err) => {
        if (err) return res.status(500).json({ message: "Internal server error" });

        const fetchQuery = `
          SELECT user_id, userName, firstName, middleName, lastName, email, mobile, gender, dob, 
                 isEmailVerified, isMobileVerified, martialStatus as maritalStatus, 
                 DATE_FORMAT(dob, '%Y-%m-%d') AS dob 
          FROM users 
          WHERE user_id = ?;
        `;
        connection.query(fetchQuery, [userId], (err, rows) => {
          if (err) return res.status(500).json({ message: "Internal server error" });
          if (rows.length > 0) {
            res.status(200).json({
              ...rows[0],
              message: "Profile Edited Successfully"
            });
          } else {
            res.status(404).json({ message: "User not found" });
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// My Bookings
exports.myBookings = async (req, res) => {
  try {
    const userId = req.user;
    const query = `
      SELECT 
        u.id AS user_id, u.name AS user_name, u.email AS user_email,
        b.id AS booking_id, b.departure_date, b.arrival_date, b.status,
        t.name AS train_name, fs.name AS from_station, ts.name AS to_station,
        r.departure_time AS departure_time, r.arrival_time AS arrival_time
      FROM 
        users u
        JOIN Bookings b ON u.id = b.UserId
        JOIN Trains t ON b.TrainId = t.id
        JOIN Stations fs ON b.from_station_id = fs.id
        JOIN Stations ts ON b.to_station_id = ts.id
        JOIN Routes r ON t.id = r.StationId
      WHERE 
        u.id = ?;
    `;

    connection.query(query, [userId], (err, bookings) => {
      if (err) return res.status(500).json({ error: "Internal Server Error" });
      res.status(200).json({ bookings });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Edit Traveller
exports.editTraveller = async (req, res) => {
  console.log("Edit Passenger API triggered..");
  
  try {
    const { passengerId } = req.params;
    if (!passengerId) {
      return res.status(400).json({ success: false, message: "Passenger ID is required" });
    }

    const getUserQuery = `SELECT user_id FROM users WHERE email = ?`;
    const [userResult] = await new Promise((resolve, reject) => {
      connection.query(getUserQuery, [req.user.email], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }).catch(err => { throw err; });

    if (!userResult) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user_id = userResult.user_id;
    
    // Verify the passenger belongs to the user
    const verifyQuery = `SELECT passengerId FROM passengers WHERE passengerId = ? AND user_id = ?`;
    const [passenger] = await new Promise((resolve, reject) => {
      connection.query(verifyQuery, [passengerId, user_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }).catch(err => { 
      console.error("Error verifying passenger:", err);
      throw new Error("Error verifying passenger ownership");
    });

    if (!passenger) {
      await new Promise((resolve) => connection.rollback(() => resolve()));
      return res.status(404).json({ success: false, message: "Passenger not found or access denied" });
    }

    const {
      firstname, mobile, dob,
      passengerName, passengerAge, passengerMobileNumber,
      passengerGender, passengerBerthChoice, passengerBedrollChoice,
      passengerNationality, country, foodPreference,
      contact_email, address
    } = req.body;

    // Prepare update fields and values
    const updateFields = [];
    const values = [];

    if (passengerName || firstname) {
      updateFields.push("passengerName = ?");
      values.push(passengerName || firstname);
    }

    if (passengerAge || dob) {
      let age = passengerAge;
      if (!age && dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      }
      updateFields.push("passengerAge = ?", "pasenger_dob = ?");
      values.push(age, dob || null);
    }

    if (passengerMobileNumber || mobile) {
      updateFields.push("passengerMobileNumber = ?");
      values.push(passengerMobileNumber || mobile);
    }

    if (passengerGender) {
      const gender = passengerGender.toString().toUpperCase();
      const formattedGender = gender === 'MALE' || gender === 'M' ? 'M' :
                           gender === 'FEMALE' || gender === 'F' ? 'F' : gender;
      updateFields.push("passengerGender = ?");
      values.push(formattedGender);
    }

    if (passengerBerthChoice !== undefined) {
      updateFields.push("passengerBerthChoice = ?");
      values.push(passengerBerthChoice);
    }

    if (passengerBedrollChoice !== undefined) {
      updateFields.push("passengerBedrollChoice = ?");
      values.push(passengerBedrollChoice ? 1 : 0);
    }

    const nationality = passengerNationality || country;
    if (nationality) {
      updateFields.push("passengerNationality = ?");
      values.push(nationality);
    }

    if (foodPreference) {
      updateFields.push("passengerFoodChoice = ?");
      values.push(foodPreference);
    }

    if (contact_email !== undefined) {
      updateFields.push("contact_email = ?");
      values.push(contact_email || null);
    }

    if (address !== undefined) {
      updateFields.push("address = ?");
      values.push(address || null);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    // Add passengerId for WHERE clause
    values.push(passengerId, user_id);

    const updateQuery = `
      UPDATE passengers 
      SET ${updateFields.join(', ')}
      WHERE passengerId = ? AND user_id = ?
    `;

    await new Promise((resolve, reject) => {
      connection.query(updateQuery, values, (err, result) => {
        if (err) {
          console.error("Error updating passenger:", err);
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return reject(new Error("No rows were updated"));
        }
        resolve();
      });
    });

    return res.status(200).json({ 
      success: true, 
      message: "Passenger updated successfully",
      passengerId: passengerId
    });

  } catch (error) {
    console.error("Error in editTraveller:", error);
    
    // Handle specific error cases
    if (error.message.includes("ER_DUP_ENTRY") || error.message.includes("Duplicate entry")) {
      return res.status(409).json({ 
        success: false, 
        message: "A passenger with similar details already exists" 
      });
    }
    
    if (error.message === "No rows were updated") {
      return res.status(404).json({
        success: false,
        message: "Passenger not found or no changes were made"
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "An error occurred while updating passenger",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add Traveller
exports.addTraveller = async (req, res) => {
  console.log("Passenger API triggered..");

  try {
    const getUserQuery = `SELECT user_id FROM users WHERE email = ?`;

    connection.query(getUserQuery, [req.user.email], (err, userResult) => {
      if (err) return res.status(500).json({ message: "Internal server error" });
      if (userResult.length === 0) return res.status(404).json({ message: "User not found" });

      const user_id = userResult[0].user_id;

      const {
        firstname, mobile, dob,
        passengerName, passengerAge, passengerMobileNumber,
        passengerGender, passengerBerthChoice, passengerBedrollChoice,
        passengerNationality, country, foodPreference,
        contact_email, address
      } = req.body;

      const name = passengerName || firstname;
      let age = passengerAge || null;
      if (!age && dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      }

      const phoneNumber = passengerMobileNumber || mobile;

      let formattedGender = null;
      if (passengerGender) {
        const gender = passengerGender.toString().toUpperCase();
        formattedGender = gender === 'MALE' || gender === 'M' ? 'M' :
          gender === 'FEMALE' || gender === 'F' ? 'F' : gender;
      }

      const nationality = passengerNationality || country || null;
      const bedrollChoice = passengerBedrollChoice ? 1 : 0;

      const insertQuery = `
        INSERT INTO passengers (
          user_id, passengerName, passengerAge, passengerGender, 
          passengerMobileNumber, passengerBerthChoice, passengerBedrollChoice, 
          passengerNationality, passengerFoodChoice, pasenger_dob,
          contact_email, address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        user_id, name, age, formattedGender,
        phoneNumber, passengerBerthChoice, bedrollChoice,
        nationality, foodPreference, dob || null,
        contact_email || null, address || null
      ];

      connection.query(insertQuery, values, (insertErr, insertResults) => {
        if (insertErr) return res.status(500).json({ message: "Database error", error: insertErr.message });
        return res.status(201).json({ message: "Passenger added successfully", passengerId: insertResults.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get Travellers
exports.getTravelers = async (req, res) => {
  try {
    const getUserQuery = `SELECT user_id FROM users WHERE email = ?`;

    connection.query(getUserQuery, [req.user.email], (err, userResult) => {
      if (err) return res.status(500).json({ message: "Internal server error" });
      if (userResult.length === 0) return res.status(404).json({ message: "User not found" });

      const userId = userResult[0].user_id;
      const query = `SELECT * FROM passengers WHERE user_id = ?;`;

      connection.query(query, [userId], (err, travelers) => {
        if (err) return res.status(500).json({ message: "Internal server error", error: err.message });

        const mappedTravelers = travelers.map(traveler => ({
          passengerId: traveler.passengerId,
          passengerName: traveler.passengerName,
          passengerAge: traveler.passengerAge,
          passengerGender: traveler.passengerGender,
          passengerBerthChoice: traveler.passengerBerthChoice || null,
          passengerBedrollChoice: traveler.passengerBedrollChoice || 0,
          country: traveler.passengerNationality || null,
          passengerMobileNumber: traveler.passengerMobileNumber || null,
          dob: traveler.pasenger_dob || null,
          passengerFoodChoice: traveler.foodPreference || null,
          contact_email: traveler.contact_email || null,
          address: traveler.address || null
        }));

        res.status(200).json(mappedTravelers);
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove Traveller
exports.removeTraveller = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    if (!id || !userId) {
      return res.status(400).json({ message: "Please provide a valid traveller id and user id" });
    }

    const query = `
      DELETE FROM passengers 
      WHERE passengerId = ? AND user_id = ?;
    `;

    connection.query(query, [id, userId], (err) => {
      if (err) return res.status(500).json({ message: "Internal server error" });
      res.status(200).json({ message: "Traveller removed successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Image Upload
exports.imageUpload = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = req.file.path;
    await connection.promise().query('UPDATE users SET img_url = ? WHERE user_id = ?', [imageUrl, userId]);
    res.status(200).json({ img_url: imageUrl, message: 'Image uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};