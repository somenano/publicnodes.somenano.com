// TODO: banner

class Node {
    constructor(name=undefined, url=undefined, ws=undefined, comment=undefined) {
        this.name = name;
        this.url = url;
        this.ws = ws;
    }

    api(params, property_to_validate=undefined) {
        return new Promise((resolve, reject) => {
            let date_start = new Date();
            Node.post(this.url, params, function(data) {
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
        return this.api({
            action: 'version'
        }, 'node_vendor');
    }

    block_count() {
        return this.api({
            action: 'block_count'
        }, 'count');
    }

    process(json_block, subtype, block) {
        return this.api({
            'action': 'process',
            'json_block': json_block,
            'subtype': subtype,
            'block': block
        }, 'hash');
    }

    work_generate(hash) {
        return this.api({
            'action': 'work_generate',
            'hash': hash
        }, 'work');
    }
}

Node.post = function(url, params, success_cb, fail_cb) {
    /* Sends POST request
     *  Arguments
     *   url: target of POST request
     *   params: object of parameters, will run through JSON.stringify()
     *   success_cb: on success of POST request, callback function passed responseText object
     *   fail_cb: on fail of POST request, callback function passed the response object
     *  Returns undefined
     */

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            try {
                success_cb(JSON.parse(this.responseText));
            } catch(e) {
                console.error('Failed to parse response from node');
                console.error(this.responseText);
                fail_cb(this);
            }
        } else if (this.readyState == 4 && this.status != 200) {
            fail_cb(this);
        }
    };
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(params));

    return undefined;
}

Node.block = function(type, account, previous, representative, balance, link, link_as_account, signature, work) {
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