const User = require("../models/user");
const Traveller = require("../models/traveller")
const sequelize = require("../utils/database");

exports.getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await User.findAll({
      attributes: ["name", "email"],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.json(recentUsers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const name = req.user;

    const user = await User.findByPk(name, {
      attributes: ["name", "email", "lastname", "mobile", "gender", "dob"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.editUserProfile = async (req, res) => {
  try {
    let { name, lastname, mobile, dob, gender, email } = req.body;


    name = name || null;
    lastname = lastname || null;
    mobile = mobile || null;
    gender = gender || null;
    email = email || null;
    dob = dob || null;

    const user = await User.findByPk(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.lastname = lastname;
    user.mobile = mobile;
    user.dob = dob;
    user.gender = gender;
    user.email = email;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.myBookings = async (req, res) => {
  try {
    const userId = req.user;

    const query = `
          SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    b.id AS booking_id,
    b.departure_date,
    b.arrival_date,
    b.status,
    t.name AS train_name,
    fs.name AS from_station,
    ts.name AS to_station,
    r.departure_time AS departure_time,
    r.arrival_time AS arrival_time
FROM
    travel_app_db.users u
    JOIN travel_app_db.bookings b ON u.id = b.UserId
    JOIN travel_app_db.trains t ON b.TrainId = t.id
    JOIN travel_app_db.stations fs ON b.from_station_id = fs.id
    JOIN travel_app_db.stations ts ON b.to_station_id = ts.id
    JOIN travel_app_db.routes r ON t.id = r.StationId
WHERE
    u.id = :userId;
        `;

    const bookings = await sequelize.query(query, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.addTraveller = async (req, res) => {
  try {
    let { firstname, lastname, mobile, dob } = req.body;
    
    const userId = req.user; 

    if (!firstname || !lastname || !mobile || !userId) {
      return res.status(400).json({ message: "Please provide all required fields: firstName, lastName, mobile, userId" });
    }
    const traveller = await Traveller.create({
      firstname,
      lastname,
      mobile,
      dob,
      userId: req.user,
    });

    res.status(200).json({
      message: 'Traveller added successfully',
      traveller
    });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getTravelers = async (req, res) => {
  try {
    const userId = req.user;
    // Use raw SQL query with parameterized inputs
    const travelers = await sequelize.query(
      'SELECT id, firstname, lastname, mobile, dob FROM travellers WHERE userId = :userId',
      {
        replacements: { userId: userId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(travelers);
  } catch (error) {
    console.error("Error fetching travelers:", error);
    res.status(500).json({ message: "Internal server error" }); 
  }
};

exports.removeTraveller = async (req, res) => {
  try {
    const { id } = req.params;  
    const userId = req.user;

    if (!id || !userId) {
      return res.status(400).json({
        message: "Please provide a valid traveller id and user id",
      });
    }

    const traveller = await Traveller.findOne({
      where: { id, userId },
    });

    if (!traveller) {
      return res.status(404).json({
        message: "Traveller not found",
      });
    }

    await traveller.destroy();

    res.status(200).json({
      message: "Traveller removed successfully",
    });
  } catch (error) {
    console.error("Error removing traveler:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

