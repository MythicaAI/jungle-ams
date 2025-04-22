function headers_json_log(r) {
    return ngx.log(ngx.WARN, JSON.stringify(r.headersIn))
}

export default {headers_json_log};