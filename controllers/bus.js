const connection = require('../utils/database');
const moment = require('moment');
const { default: axios } = require('axios');
const { response } = require('express');
const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

exports.authenticateBusAPI = async (req, res) => {
    // console.log("Yes, calling the bus ");
    

    const data = {
        "UserName": process.env.BUS_API_USERNAME,
        "Password": process.env.BUS_API_PASSWORD,
        "ClientId": process.env.BUS_API_CLIENT_ID,
        "EndUserIp": getLocalIP()
    }
    // console.log("DAta is working... ",data);
    
    try {
        const apiResponse = await axios.post(
            'http://sharedapi.tektravels.com/SharedData.svc/rest/Authenticate',
            data,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        // console.log("API Response is working... ",apiResponse.data);
        res.status(200).json({TokenId:apiResponse.data.TokenId,EndUserIp:getLocalIP()});
    } catch (error) {
        // console.error('Error fetching bus cities:', error);
        res.status(500).json({ message: error.message });
    }
}

exports.GetBusCityList = async (req, res) => {
    const { TokenId, IpAddress } = req.body;
    // console.log("TokenId is working... ", TokenId, IpAddress);

    if (!TokenId || !IpAddress) {
        return res.status(400).json({ message: "TokenId and IpAddress are required in the request body." });
    }

    const data = {
        "TokenId": TokenId,
        "IpAddress": IpAddress,
        "ClientId": process.env.BUS_API_CLIENT_ID
    };
    // console.log("Data is working... ", data);

    try {
        const apiResponse = await axios.post(
            'https://Sharedapi.tektravels.com/StaticData.svc/rest/GetBusCityList',
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        // console.log("API Response is working... ", apiResponse.data);
        res.status(200).json(apiResponse.data);
    } catch (error) {
        // console.error('Error fetching bus cities:', error);
        res.status(500).json({ message: error.message });
    }
}

exports.BusSearch=async(req,res)=>{
    const {DateOfJourney,DestinationId,EndUserIp,OriginId,BookingMode,TokenId,PreferredCurrency} = req.body

    const data = {
        "DateOfJourney":DateOfJourney,
        "DestinationId":DestinationId,
        "EndUserIp":EndUserIp,
        "OriginId":OriginId,
        "BookingMode":BookingMode,
        "TokenId":TokenId,
        "PreferredCurrency":PreferredCurrency,
    }
    try {
        const apiResponse = await axios.post('https://busbe.tektravels.com/Busservice.svc/rest/Search',data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        // console.log("API Response is working... ",apiResponse.data);
        res.status(200).json(apiResponse.data);
    } catch (error) {
        // console.error('Error fetching bus search:', error);
        res.status(500).json({ message: error.message });
    }
}
exports.GetBusSeatLayOut=async(req,res)=>{
    const {EndUserIp,ResultIndex,TraceId,TokenId}=req.body
    const data={
        "EndUserIp":EndUserIp,
        "ResultIndex":ResultIndex,
        "TraceId":TraceId,
        "TokenId":TokenId
    }
        try {
            const apiResponse = await axios.post('https://busbe.tektravels.com/Busservice.svc/rest/GetBusSeatLayOut',data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            // console.log("API Response is working... ",apiResponse.data);
            res.status(200).json(apiResponse.data);
        } catch (error) {
            // console.error('Error fetching bus seat lay out:', error);
            res.status(500).json({ message: error.message });
        }
}

exports.GetBoardingPintDetails=async(req,res)=>{
    const {EndUserIp,ResultIndex,TraceId,TokenId}=req.body
    const data={
        "EndUserIp":EndUserIp,
        "ResultIndex":ResultIndex,
        "TraceId":TraceId,
        "TokenId":TokenId
    }
    try {
        const apiResponse = await axios.post('https://BusBE.tektravels.com/Busservice.svc/rest/GetBoardingPointDetails',data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        // console.log("API Response is working... ",apiResponse.data);
        res.status(200).json(apiResponse.data);
    } catch (error) {
        // console.error('Error fetching boarding point details:', error);
        res.status(500).json({ message: error.message });
    }
}
