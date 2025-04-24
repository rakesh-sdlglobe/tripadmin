const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.SECRET, { expiresIn: "2d" });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

module.exports = { generateAccessToken, generateRefreshToken };
