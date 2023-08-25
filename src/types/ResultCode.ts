const enum ResultCode{
    OK = 0,
    FAIL = 1,

    CONFIGURATION_ERROR = 50000,
    CONNECTION_ERROR = 50001,
    TIMEOUT = 50002,
}

export const ResultCodeDescription = {
    [ResultCode.OK]: "Success",
    [ResultCode.FAIL]: "Fail",

    [ResultCode.TIMEOUT]: "Request timeout"
}

export default ResultCode;
