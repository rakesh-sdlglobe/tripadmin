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
    const { fromStnCode, toStnCode, journeyDate, paymentEnqFlag = "N" } = req.body;
    const jQuotaList = ["GN", "TQ", "LD", "PT"];

    try {
        // 1. First API call to get trains
        const baseUrl = 'https://stagews.irctc.co.in/eticketing/webservices/taenqservices';
        const trainsUrl = `${baseUrl}/tatwnstns/${fromStnCode}/${toStnCode}/${journeyDate}`;
        const trainsResponse = await axios.get(trainsUrl, auth, { headers: apiHeaders });

        let trains = trainsResponse.data?.trainBtwnStnsList || [];

        const bodyContent = {
            "masterId": "WSMTB2C00000",
            "enquiryType": "3",
            "reservationChoice": "99",
            "moreThanOneDay": "true"
        };

        // 2. Prepare all API calls in advance
        const apiCalls = [];
        
        for (const train of trains) {
            train.availabilities = [];
            const { trainNumber, avlClasses, fromStnCode, toStnCode } = train;
            
            for (const jQuota of jQuotaList) {
                for (const cls of avlClasses) {
                    const fareUrl = `${baseUrl}/avlFareenquiry/${trainNumber}/${journeyDate}/${fromStnCode}/${toStnCode}/${cls}/${jQuota}/${paymentEnqFlag}`;
                    
                    apiCalls.push({
                        promise: axios.post(fareUrl, bodyContent, auth, { headers: apiHeaders }),
                        trainIndex: trains.indexOf(train),
                        quota: jQuota,
                        class: cls
                    });
                }
            }
        }

        // 3. Execute API calls in parallel with rate limiting
        const batchSize = 5; // Adjust based on API rate limits
        const results = [];
        
        for (let i = 0; i < apiCalls.length; i += batchSize) {
            const batch = apiCalls.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async call => {
                    try {
                        const response = await call.promise;
                        return {
                            ...call,
                            data: response.data,
                            success: true
                        };
                    } catch (error) {
                        return {
                            ...call,
                            error,
                            success: false
                        };
                    }
                })
            );
            results.push(...batchResults);
            
            // Optional: Add small delay between batches to prevent rate limiting
            if (i + batchSize < apiCalls.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // 4. Process results and update trains
        for (const result of results) {
            if (!result.success) continue;
            const { data, trainIndex, quota } = result;
            const { avlDayList, totalFare, enqClass, baseFare, bkgCfg } = data;

            if (!avlDayList) continue;

            // Skip processing if train has departed
            if ((quota === "TQ" || quota === "PT") && 
                avlDayList[0]?.availablityStatus === "TRAIN DEPARTED") {
                continue;
            }

            const availabilityData = {
                avlDayList,
                totalFare,
                baseFare,
                enqClass,
                quota,
                ...(bkgCfg && { applicableBerthTypes: bkgCfg.applicableBerthTypes })  // Only add if bkgCfg exists
            };
            
            trains[trainIndex].availabilities.push(availabilityData);
        }

        res.json({ ...trainsResponse.data, trainBtwnStnsList: trains });

    } catch (error) {
        console.error('Error fetching trains:', error.response?.data || error.message);
        res.status(500).json({ 
            message: 'Failed to fetch trains', 
            error: error.response?.data || error.errorMessage
        });
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


exports.getTrainSchedule = async (req, res) => {
    console.log("141 came to call the train schedule api.")
    try {
        const { trainNumber } = req.params;

        const url = `https://stagews.irctc.co.in/eticketing/webservices/taenqservices/trnscheduleEnq/${trainNumber}`
        const response = await axios.get(url,auth);

        if (response.data) {
            console.log("148 code response", response.data)    
            res.status(200).json(response.data);
        } else {
        res.status(404).json({ message: "Train data not found" });
        }
    } catch (error) {
        console.error("Error fetching train schedule:", error.message);
        res.status(500).json({ message: "Failed to fetch train schedule" });
    }
};

exports.getBoardingStations = async (req, res) => {
    console.log("263 came to call the boarding stations api.",req.body)
    try {
        const { trainNumber, journeyDate, fromStnCode, toStnCode, jClass } = req.body;

        const url = `https://stagews.irctc.co.in/eticketing/webservices/taenqservices/boardingstationenq/${trainNumber}/${journeyDate}/${fromStnCode}/${toStnCode}/${jClass}`
        const response = await axios.get(url,auth);

        if (response.data?.boardingStationList) {
            console.log("271 code response", response.data)    
            res.status(200).json(response.data.boardingStationList);
        } else {
        res.status(404).json({ message: "Boarding Stations not found" });
        }
    } catch (error) {
        console.error("Error fetching train boarding stations", error.message);
        res.status(500).json({ message: "Failed while fetching train boarding stations" });
    }
};


exports.getUsernameFromIRCTC = async (req, res) => {
    console.log("283 came to call the boarding stations api.",req.params)
    try {
        const { userName } = req.params;

        const url = `https://stagews.irctc.co.in/eticketing/webservices/taprofileservices/getUserStatus/${userName}`
        const response = await axios.get(url,auth);
        console.log("271 code response", response.data)
        if (response.data.status ) {
            console.log("271 code response", response.data)    
            res.status(200).json({ success : response.data.userId });
        } else if (response.data.error){
        res.status(200).json({ error : response.data.error });
        }
    } catch (error) {
        console.error("Error fetching IRCTC userName", error.message.error);
        res.status(200).json({ error : error.message.error });
    }
};

exports.getCountryList = async (req, res) => {
    try{
        const url = "https://stagews.irctc.co.in/eticketing/webservices/userregistrationservice/country";
        const response = await axios.get(url,auth);
        console.log("271 code response", response.data)
        if(response.data.countryList)
            res.status(200).json(response.data?.countryList);
        else
            console.log("Country list not found", response.data);
            res.status(404).json({ message: "Country list not found" });
    }catch(error){
        console.log("Error in fetching the country list", error);
        res.status(500).json({ message: "Failed to fetch country list" });
    }
}




// exports.getTrains = async (req, res) => {
//     // console.log("req",req);
//     let { fromStnCode, toStnCode, journeyDate, paymentEnqFlag = "N" } = req.body;
//     // console.log("req body" , req.body);
//     const jQuotaList  = ["GN","TQ","LD","PT"]
//     avlDayList = []

//     console.log(fromStnCode, toStnCode, journeyDate);
//     try {
//         const url = `https://stagews.irctc.co.in/eticketing/webservices/taenqservices/tatwnstns/${fromStnCode}/${toStnCode}/${journeyDate}`;
//         let response = await axios.get(url,auth, { headers: apiHeaders });
//         console.log("Now trying the fare enquiry details for the trains");
//         console.log("respnse is ",response.data)
//         let trains = response.data?.trainBtwnStnsList;

//         const bodyContent = {
//             "masterId": "WSMTB2C00000",
//             "enquiryType": "3",
//             "reservationChoice": "99",
//             "moreThanOneDay": "true"
//         }
        
//         for (let i = 0; i < trains?.length; i++) {
//             trains[i].availabilities = []
//             const { trainNumber, avlClasses, fromStnCode, toStnCode } = trains[i];
//             // Iterate over available classes for each train
//             for (let j = 0; j < jQuotaList?.length; j ++){
//                 let jQuota = jQuotaList[j]
//                 for (let cls of avlClasses) {
//                     console.log("Cls value is ", cls)
                    
//                     let trainFareAPIUrl = `https://stagews.irctc.co.in/eticketing/webservices/taenqservices/avlFareenquiry/${trainNumber}/${journeyDate}/${fromStnCode}/${toStnCode}/${cls}/${jQuota}/${paymentEnqFlag}`;
                    
//                     let fareDetailedTrainData = await axios.post(trainFareAPIUrl, bodyContent, auth, { headers: apiHeaders });
                    
//                     let { avlDayList, totalFare, enqClass, quota } = fareDetailedTrainData.data
//                     if(avlDayList ){
//                         // if (quota == "LD" && avlDayList?.[0]?.availablityStatus === "NOT AVAILABLE") continue;

//                         fareDetailedTrainData = { avlDayList, totalFare, enqClass, quota } 
//                         trains[i].availabilities.push(fareDetailedTrainData) ;
//                         if ((quota === "TQ" || quota === "PT") && avlDayList[0]?.availablityStatus === "TRAIN DEPARTED") {
//                             console.log("Train has departed. Breaking out of the loop.");
//                             break;  // Break out of the inner loop for this quota and don't iterate for the next class
//                         }
//                     }
//                     // if(avlDayList?.[0]?.availablityStatus == "TRAIN DEPARTED") break;

//                 }
//                 // if(avlDayList?.[0]?.availablityStatus == "TRAIN DEPARTED") break;

//             }
//         }
        
//         // After all the trains are updated, assign the updated trains back to response.data
//         response.data.trainBtwnStnsList = trains;
        
//         res.json(response.data);  // Sending updated response back to the client
        
//     } catch (error) {
//         console.error('Error fetching trains:', error.response ? error.response.data : error.message);
//         res.status(500).json({ message: 'Failed to fetch trains', error : error.response ? error.response.data : error.message });
//     }
// } 






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