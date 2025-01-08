const connection = require('../utils/database');
const moment = require('moment');
const { default: axios } = require('axios');
const { response } = require('express');


// ITCTC API Authentication Credentials

const auth = {
    auth: {
        username: process.env.IRCTC_API_USERNAME,
        password: process.env.IRCTC_API_PASSWORD, 
    },
};

const apiHeaders = {
    "Content-Type": "application/json",
    "Accept-Encoding": "gzip,deflate",
    "Host": "stagews.irctc.co.in"
};

exports.getStation = async (req, res) => {
    try {
        const apiResponse = await axios.get('https://www.irctc.co.in/eticketing/StationListServlet.js');
        // console.log("Fetched stations from IRCTC API successfully.", apiResponse.data);
        const responseData = apiResponse.data; // Example: 'var stationName=[...]';
        
        // Remove the 'var stationName=' part and parse the array
        const arrayStartIndex = responseData.indexOf('[');
        const arrayEndIndex = responseData.lastIndexOf(']');
        const arrayString = responseData.substring(arrayStartIndex, arrayEndIndex + 1);

        // Convert the string to an actual JavaScript array
        const stationArray = JSON.parse(arrayString.replace(/\\/g, ''));

        // console.log("Station Array:", stationArray);
        res.status(200).json({ stations: stationArray });
    } catch (apiError) {
        console.error("Error fetching stations from IRCTC API:", apiError.message);
        return res.status(500).json({
            message: "Error fetching stations from IRCTC API",
            error: apiError.message,
        });
    }

}


exports.getTrains = async (req, res) => {
    // console.log("req",req);
    let { fromStnCode, toStnCode, journeyDate, jQuota = "GN", paymentEnqFlag = "N" } = req.body;
    // console.log("req body" , req.body);
    console.log(fromStnCode, toStnCode, journeyDate);
    try {
        const url = `https://stagews.irctc.co.in/eticketing/webservices/taenqservices/tatwnstns/${fromStnCode}/${toStnCode}/${journeyDate}`;
        let response = await axios.get(url,auth, { headers: apiHeaders });
        console.log("Now trying the fare enquiry details for the trains");
        console.log("respnse is ",response.data)
        let trains = response.data?.trainBtwnStnsList;

        const bodyContent = {
            "masterId": "WSMTB2C00000",
            "enquiryType": "3",
            "reservationChoice": "99",
            "moreThanOneDay": "true"
        }
        
        for (let i = 0; i < trains.length; i++) {
            trains[i].availabilities = []
            const { trainNumber, avlClasses, fromStnCode, toStnCode } = trains[i];
            let trainClassTotal
            // Iterate over available classes for each train
            console.log("Classes are " , avlClasses);
            console.log(trainNumber, journeyDate, fromStnCode, toStnCode, jQuota, paymentEnqFlag, " -> for the fare enquiry");
            for (let cls of avlClasses) {
                console.log("Cls value is ", cls)
                let trainFareAPIUrl = `https://stagews.irctc.co.in/eticketing/webservices/taenqservices/avlFareenquiry/${trainNumber}/${journeyDate}/${fromStnCode}/${toStnCode}/${cls}/${jQuota}/${paymentEnqFlag}`;
                
                let fareDetailedTrainData = await axios.post(trainFareAPIUrl, bodyContent, auth, { headers: apiHeaders });

                let { avlDayList, totalFare, enqClass, quota } = fareDetailedTrainData.data
                fareDetailedTrainData = { avlDayList, totalFare, enqClass, quota } 
                trains[i].availabilities.push(fareDetailedTrainData)
            }
        }
        
        // After all the trains are updated, assign the updated trains back to response.data
        response.data.trainBtwnStnsList = trains;
        res.json(response.data);  // Sending updated response back to the client
        
    } catch (error) {
        console.error('Error fetching trains:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to fetch trains', error : error.response ? error.response.data : error.message });
    }
} 

exports.getTrainsAvailableFareEnquiry = async (req, res) => {
    const { trainNo, journeyDate , fromStnCode, toStnCode, jClass, jQuota, paymentEnqFlag } = req.body;
    const bodyContent = {
        "masterId": "WSMTB2C00000",
        "enquiryType": "3",
        "reservationChoice": "99",
        "moreThanOneDay": "true"
    }
    console.log(trainNo, journeyDate, fromStnCode, toStnCode, jClass, jQuota, paymentEnqFlag, " -> for the fare enquiry");
    try{
        const url = `https://stagews.irctc.co.in/eticketing/webservices/taenqservices/avlFareenquiry/${trainNo}/${journeyDate}/${fromStnCode}/${toStnCode}/${jClass}/${jQuota}/${paymentEnqFlag}`;
        const response = await axios.post(url,bodyContent,auth, { headers: apiHeaders });
        console.log(response.data);
        res.json(response.data);
    }catch(error){
        console.error('Error fetching trains:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to fetch trains fare details', error: error.response ? error.response.data : error.message });
    }
}

// exports.getStation = (req, res) => {
//     try {
//         const query = `SELECT id, name FROM ${process.env.DB_NAME}.stations`;

//         // Execute the query using connection.query
//         connection.query(query, (error, results) => {
//             if (error) {
//                 console.error("Error fetching station details:", error);
//                 return res.status(500).json({ error: "Internal Server Error" });
//             }
            
//             // Send the stations data as response
//             res.status(200).json({ stations: results });
//         });
//     } catch (error) {
//         console.error("Unexpected error fetching station details:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// exports.getTrains = async (req, res) => {
//     const { stationId, date } = req.body;

//     try {
//         const dayOfWeek = moment(date).format('dddd');
        
//         // Fetch station name from the stations table using raw SQL query
//         connection.query(
//             `SELECT name FROM ${process.env.DB_NAME}.stations WHERE id = ?`,
//             [stationId],
//             (error, stationResults) => {
//                 if (error) {
//                     console.error("Error fetching station details:", error);
//                     return res.status(500).json({ message: 'Database query error' });
//                 }

//                 if (stationResults.length === 0) {
//                     return res.status(404).json({ message: 'Station not found' });
//                 }

//                 const stationName = stationResults[0].name;              

//         const query = `
//             SELECT
//                 t.name AS trainName,
//                 t.number AS trainNumber,
//                 t.days AS operatingDays,
//                 r.arrival_time,
//                 r.departure_time,
//                 s1.name AS startStation,
//                 s2.name AS endStation,
//                 TIMEDIFF( r.departure_time , r.arrival_time ) AS duration,
//                 GROUP_CONCAT(s.class ORDER BY s.class) AS seatClasses,  
//                 GROUP_CONCAT(s.available_seats ORDER BY s.class) AS availableSeats,  
//                 GROUP_CONCAT(s.total_seats ORDER BY s.class) AS totalSeats,  
//                 GROUP_CONCAT(s.price ORDER BY s.class) AS price
//             FROM
//                 ${process.env.DB_NAME}.trains t
//             JOIN
//                 ${process.env.DB_NAME}.stations s1 ON t.start_station_id = s1.id
//             JOIN
//                 ${process.env.DB_NAME}.stations s2 ON t.end_station_id = s2.id
//             JOIN
//                 ${process.env.DB_NAME}.routes r ON r.train_id = t.id
//             JOIN
//                 ${process.env.DB_NAME}.seats s ON s.train_id = t.id
//             WHERE
//                     (s1.name = ? OR s2.name = ?)
//                     AND FIND_IN_SET(?, t.days) > 0
//             GROUP BY
//                 t.id, r.arrival_time, r.departure_time, s1.name, s2.name;
//         `;

//         connection.query(query, [stationName, stationName, dayOfWeek], (err, trainResults) => {
//         if (err) {
//             console.error("Error fetching trains:", err);
//             return res.status(500).json({ message: 'Database query error' });
//         }

//         if (trainResults.length === 0) {
//             return res.status(404).json({ message: 'No trains available for the selected station and date' });
//         }
        

//         // Process the seat details for each train
//         const processedTrains = trainResults.map(train => {
//             const seatClassesArray = train.seatClasses.split(',');
//             const availableSeatsArray = train.availableSeats.split(',');
//             const totalSeatsArray = train.totalSeats.split(',');
//             const priceArray = train.price.split(',');

//             const seats = seatClassesArray.map((seatClass, index) => ({
//                 seatClass: seatClass.trim(),
//                 availableSeats: parseInt(availableSeatsArray[index], 10),
//                 totalSeats: parseInt(totalSeatsArray[index], 10),
//                 price: parseInt(priceArray[index], 10),
//             }));

//             return {
//                 ...train,
//                 seats,
//             };
//         });
        
//         // Send the response with the processed train data
//         res.status(200).json({ trains: processedTrains });
//     });
// }
// ); } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Server error' });
//   }
//   };