///////////////////////
// Config
REQUEST_TIMEOUT = 10*1000;   // 10 seconds

///////////////////////

const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''); // https://stackoverflow.com/a/58326357

class NodeAPI {
    constructor(url) {
        this.url = url;
    }

    call(params) {
        return new Promise((resolve, reject) => {
            let date_start = new Date();
            NodeAPI.post(this.url, params, function(data) {
                // Request returned HTTP 200
                let date_complete = new Date();
                resolve({
                    success: true,
                    date_start: date_start,
                    date_complete: date_complete,
                    data: data
                });
                return;
            }, function(data) {
                // Request returned other than HTTP 200
                let date_complete = new Date();
                resolve({
                    success: false,
                    date_start: date_start,
                    date_complete: date_complete,
                    data: data
                });
                return;
            });
        });
    }

    version() {
        return this.call({
            action: 'version'
        });
    }

    block_count() {
        return this.call({
            action: 'block_count'
        });
    }

    process(json_block, subtype, block) {
        return this.call({
            'action': 'process',
            'json_block': json_block,
            'subtype': subtype,
            'block': block
        });
    }

    work_generate(hash) {
        return this.call({
            'action': 'work_generate',
            'hash': hash
        });
    }
}

NodeAPI.post = function(url, params, success_cb, fail_cb) {
    /* Sends POST request
     *  Arguments
     *   url: target of POST request
     *   params: object of parameters, will run through JSON.stringify()
     *   success_cb: on success of POST request, callback function passed responseText object
     *   fail_cb: on fail of POST request, callback function passed the response object
     *  Returns undefined
     */

    let xhttp = new XMLHttpRequest();
    xhttp.timeout = REQUEST_TIMEOUT;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            try {
                success_cb(JSON.parse(this.responseText));
                return;
            } catch(e) {
                console.error('Failed to parse response from node');
                console.error(this.responseText);
                fail_cb({error: 'Unable to parse response', timeout: this.timeout});
                return;
            }
        } else if (this.readyState == 4 && this.status != 200) {
            if (this.responseText !== undefined) {
                try {
                    fail_cb(JSON.parse(this.responseText));
                    return;
                } catch(e) {
                    console.error('Failed to parse response from node');
                    console.error(this.responseText);
                    if (this.status !== undefined && this.status > 0) {
                        fail_cb({error: 'Request returned HTTP '+ this.status, timeout: this.timeout});
                        return;
                    } else {
                        fail_cb({error: 'Request failed', timeout: this.timeout});
                        return;
                    }
                }
            }
            if (this.status !== undefined && this.status > 0) {
                fail_cb({error: 'Request returned HTTP '+ this.status, timeout: this.timeout});
                return;
            } else {
                fail_cb({error: 'Request timed out', timeout: this.timeout});
                return;
            }
        }
    };
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(params));

    return undefined;
}

NodeAPI.block = function(type, account, previous, representative, balance, link, link_as_account, signature, work) {
    return {
        type: type,
        account: account,
        previous: previous,
        representative: representative,
        balance: balance,
        link: link,
        link_as_account: link_as_account,
        signature: signature,
        work: work
    }
}

class NodeWebSocket {
    constructor(url, message_handler) {
        this.url = url;
        this.message_handler = message_handler;
        this.failed = false;
        this.socket_callbacks = {};
        try {
            this.socket = new WebSocket(this.url);
            this.socket.onopen = () => { this.onopen() };
            this.socket.onmessage = (data) => { this.onmessage(data); }
            this.socket.onerror = (error) => { this.onerror(error); }

            this.setupTimeout = setTimeout(() => {
                if (!this.isready()) {
                    console.error('Attempt to set up WebSocket failed with url: '+ this.url);
                    this.socket = undefined;
                    this.failed = true;
                }
            }, REQUEST_TIMEOUT);
        } catch(error) {
            console.error('Failed attempting to set up socket to '+ this.url);
            this.socket = undefined;
            this.failed = true;
        }
    }

    setup_promise() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.isready() == true) {
                    resolve(true);
                    return;
                } else if (this.failed == true) {
                    resolve(false);
                    return;
                }
                resolve(this.setup_promise());
                return;
            }, (REQUEST_TIMEOUT) / 20);
        });
    }

    isready() {
        return (this.socket !== undefined && this.socket.readyState == 1);
    }

    onopen() {
        clearTimeout(this.setupTimeout);
        this.setupTimeout = undefined;
    }

    onerror() {
        clearTimeout(this.setupTimeout);
        this.failed = true;
    }

    onmessage(response) {
        try {
            let data = JSON.parse(response.data);
            
            if (data.id !== undefined && Object.keys(this.socket_callbacks).indexOf(data.id) > -1) {
                // Callback found
                clearTimeout(this.socket_callbacks[data.id].timeout);
                this.socket_callbacks[data.id].cb({success: true, data: data});
                delete this.socket_callbacks[data.id];
                return;
            }

            if (this.message_handler !== undefined) {
                this.message_handler(data);
            }
        
        } catch(err) {
            console.error('In socket.onmessage, an error was returned');
            console.error(err);
        }
    }

    send_action(params, cb=undefined) {
        
        if (!this.isready()) return false;
        if (cb !== undefined) {
            params.id = genRanHex(8);
            let timeout = setTimeout(() => {
                cb({success: false, data: {}, message: 'action timed out'});
                delete this.socket_callbacks[params.id];
            }, REQUEST_TIMEOUT);
            this.socket_callbacks[params.id] = {
                cb: cb,
                timeout: timeout
            };
        }
        
        return this.socket.send(JSON.stringify(params));

    }

    ping(cb) {
        let input = {
            action: 'ping'
        }
        return this.send_action(input, cb);
    }

    subscribe_all(cb, confirmation_type='active') {
        let input = {
            action: 'subscribe',
            topic: 'confirmation',
            ack: true,
            options: {
                confirmation_type: confirmation_type
            }
        }

        return this.send_action(input, cb);
    }

    subscribe_addresses(addresses, cb, confirmation_type='active') {
        let input = {
            action: 'subscribe',
            topic: 'confirmation',
            ack: true,
            options: {
                accounts: addresses,
                confirmation_type: confirmation_type
            }
        }
    
        return this.send_action(input, cb);
    }

    unsubscribe_all(cb) {
        let input = {
            action: 'unsubscribe',
            topic: 'confirmation',
            ack: true,
        }

        return this.send_action(input, cb);
    }

    unsubscribe_addresses(addresses, cb) {
        let input = {
            action: 'unsubscribe',
            topic: 'confirmation',
            ack: true,
            options: {
                accounts: addresses
            }
        }
    
        return this.send_action(input, cb);
    }

    update_addresses(addresses_add, addresses_del, cb) {
        let input = {
            action: 'update',
            topic: 'confirmation',
            ack: true,
            options: {
                accounts_add: addresses_add,
                accounts_del: addresses_del
            }
        }
    
        return this.send_action(input, cb);
    }
}

class Node {
    constructor(name, api_url, websocket_url, websocket_message_handler) {
        this.name = name;
        this.api = undefined;
        if (api_url !== undefined) this.api = new NodeAPI(api_url);
        this.websocket = undefined;
        if (websocket_url !== undefined) this.websocket = new NodeWebSocket(websocket_url, websocket_message_handler);
    }
}

