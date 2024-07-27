function getDataParse(body) {
    if (body.data == undefined) {
        return body
    }
    return body.data
}

export default getDataParse