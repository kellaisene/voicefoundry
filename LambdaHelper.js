module.exports = {
    formatResponseData: formatResponseData
}

function formatResponseData(error, event, results, lambdaFunctionName) {
    let errorResponse = {
        lambdaFunctionName: lambdaFunctionName
    };

    let status = null

    if (error) {
        errorResponse.error = error
        if (typeof error == 'object') {
            if ((error.hasOwnProperty('stack') && error.stack != null) || (error.hasOwnProperty('stackTrace') && error.stackTrace != null)) {
                status = 'exception'
                errorResponse.error = error.stack
            } else {
                status = 'handled failure'
            }
        } else {
            status = 'handled failure'
        }

        if (event.alias == 'production') {
            sendSns('Error with ' + lambdaFunctionName, errors_arn, error, event)
        }
    } else {
        status = 'success'
        console.log('STATUS', status)
    }
    console.log('RESULTS1', results)
    console.log('TYPEOF', typeof results)
    if (results && typeof results == 'object') {
        console.log('RESULTS', results)
        return results
    } else {
        return { success: error == null ? true : false, data: error == null ? results : errorResponse }
    }
}