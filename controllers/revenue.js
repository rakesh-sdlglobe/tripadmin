const sequelize = require('../utils/database')

exports.getTotalBookingRevenue = async (req, res) => {
    try {
      // Fetch total bookings for the current month
      const totalBookingsQuery = `
        SELECT COUNT(*) AS totalBookings
        FROM \`Bookings\`
        WHERE \`booking_date\` BETWEEN '2024-09-01' AND '2024-09-30';
      `;
      const [totalBookings] = await sequelize.query(totalBookingsQuery);
  
      // Fetch total revenue for the current month
      const totalRevenueQuery = `
        SELECT SUM(amount) AS totalRevenue
        FROM \`Payments\`
        INNER JOIN \`Bookings\` ON \`Payments\`.\`BookingId\` = \`Bookings\`.\`id\`
        WHERE \`Bookings\`.\`booking_date\` BETWEEN '2024-09-01' AND '2024-09-30';
      `;
      const [totalRevenue] = await sequelize.query(totalRevenueQuery);
  
      res.json({
        totalBookings: totalBookings[0].totalBookings,
        totalRevenue: totalRevenue[0].totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching totals:', error);
      res.status(500).send('Error fetching totals');
    }
  };
