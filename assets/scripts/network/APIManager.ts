import { APIConfig } from './APIConstant';

export class APIManager{

    private static getPath(api: string): string {
        return APIConfig.apiPath + "/" + api;
    }

    public static getData(path, successCallback, errorCallback, needAuth) {
        let param = {};
        let json = JSON.stringify(param);
        let out = this.callGet(this.getPath(path), json, needAuth)
        out.then(function (result) {
            successCallback(result);
        }).catch(function (result) {
            errorCallback(result);
        });
    }

    public static putData(param, path, successCallback, errorCallback, needAuth) {
        let json = JSON.stringify(param);
        let out = this.callPut(this.getPath(path), json, needAuth)
        out.then(function (result) {
            successCallback(result);
        }).catch(function (result) {
            errorCallback(result);
        });
    }
  
    public static postData(path, param, callback, errorCallback, needAuth) {
        let json = JSON.stringify(param);
        let out1 = this.callPost(this.getPath(path), json, needAuth)
        out1.then(function (result) {
            callback(result)
        }).catch(function (result) {
            // fail logic
            errorCallback(result);
            //console.error("ERROR: ", result);
        });
    }

    public static postDataPrivy(path, param, privyToken, callback, errorCallback) {
        let json = JSON.stringify(param);
        let out1 = this.callPost(this.getPath(path), json, false, true, privyToken)
        out1.then(function (result) {
            callback(result)
        }).catch(function (result) {
            // fail logic
            errorCallback(result);
            //console.error("ERROR: ", result);
        });
    }

    private static callGet(url, param, needAuth = true) {
        return this.xmlBase('GET', url, param, needAuth);
    } 
    private static callPost(url, param, needAuth = true, callPrivy = false, privyToken = null) {
        return this.xmlBase('POST', url, param, needAuth, callPrivy, privyToken);
    }
    private static callPut(url, param, needAuth = true) {
        return this.xmlBase('PUT', url, param, needAuth);
    }

    private static xmlBase(method, url, param, needAuth = true, callPrivy = false, privyToken = null) {
        return new Promise(function (resolve, reject) {
            let http = new XMLHttpRequest();
            http.open(method, url, true);
            http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            if (needAuth) {
                http.setRequestHeader('x-access-token', APIConfig.token);
            }
            else if (callPrivy) {
                http.setRequestHeader('x-access-token', privyToken);
            }
            //http.setRequestHeader('X-Auth-Token', APIConfig.token);
            // http.ontimeout = () => {
            //     return reject(3)
            // }
            http.onerror = () => {
                console.log('on error', http);
            }
            http.onreadystatechange = () => {
                if (http.readyState == 4) {
                    console.log('api log: ', http.responseText);
                    if (http.status >= 200 && http.status < 400) {
                        let out = JSON.parse(http.responseText)
                        return (resolve(out))
                    }
                    else {
                        return reject(http.responseText);
                    }
                }
            }

            http.send(param);
        });
    }

    private xmlBaseXAuOnly(method, url, param, needAuth = true) {
        console.log(APIConfig.token);
        return new Promise(function (resolve, reject) {
            let http = new XMLHttpRequest();
            http.open(method, url, true);
            http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            if (needAuth) {
                http.setRequestHeader('X-Auth-Token', APIConfig.token);
            }
            http.onerror = () => {
                console.error('on error', http);
            }
            http.onreadystatechange = () => {
                if (http.readyState == 4) {
                    console.log('api log: ', http.responseText);
                    if (http.status >= 200 && http.status < 400) {
                        let out = JSON.parse(http.responseText)
                        console.log(out);
                        return (resolve(out))
                    }
                    else {
                        return reject(http.responseText);
                    }
                }
            }

            http.send(param);
        });
    }
}


