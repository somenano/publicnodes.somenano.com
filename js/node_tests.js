/////////////////////////////////
// Test configurations, these need updated as new versions release
//

const CURRENT_NODE_VENDOR = 'Nano V23.3';
const UNCHECKED_BLOCKS_PARTIAL = 50;
const UNCHECKED_BLOCKS_FAIL = 100;
const TEST_HASH = '718CC2121C3E641059BC1C2CFC45666C99E8AE922F7A807B7D07B62C995D79E2';
const TEST_VALID_ACCOUNT = 'nano_3t6k35gi95xu6tergt6p69ck76ogmitsa8mnijtpxm9fkcm736xtoncuohr3';
const TEST_INVALID_ACCOUNT = 'nano_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpi00000000';
const TEST_SIGNATURE = '3BFBA64A775550E6D49DF1EB8EEC2136DCD74F090E2ED658FBD9E80F17CB1C9F9F7BDE2B93D95558EC2F277FFF15FD11E6E2162A1714731B743D1E941FA4560A';
const TEST_WORK = 'cab7404f0b5449d0';

// end test configurations
/////////

const TEST_SCORE = {
    'error': -1,
    'fail': 0,
    'limited': 1,
    'not-allowed': 2,
    'partial': 3,
    'pass': 4
}
const FAILED_NODE_COMMS_STRING = 'Test failed due to failed communication with node API';

function translate_test_score_to_key(score) {
    for (let i of Object.entries(TEST_SCORE)) {
        if (score == i[1]) return i[0];
    }
    return undefined;
}

function translate_test_score_to_string(test_score) {
    let results_string = undefined;

    if (test_score == TEST_SCORE['pass']) results_string = 'Test completed successfully with status: PASS';
    else if (test_score == TEST_SCORE['partial']) results_string = 'Test completed successfully with status: PARTIAL PASS';
    else if (test_score == TEST_SCORE['limited']) results_string = 'Test did not complete successfully due to the node limiting the number of requests you send';
    else if (test_score == TEST_SCORE['fail']) results_string = 'Test completed successfully with status: FAIL';
    else if (test_score == TEST_SCORE['error']) results_string = 'Test did not complete successfully';

    return results_string;
}

function node_test_error(node, test_name, test_duration, error) {
    // Log error to console
    console.error('' + node.name + ' ran test: ' + test_name);
    console.error(' Test duration: ' + test_duration + ' milliseconds')
    console.error(' Test results: An error was caught during the test');
    console.error(error);

    return {
        test_name: test_name,
        test_score: TEST_SCORE['error'],
        test_duration: undefined,
        test_data: {}
    }
}

function node_test_complete(node, test_name, test_duration, test_score, data) {
    const test_data = {
        node: node,
        test_name: test_name,
        test_score: test_score,
        test_duration: test_duration,
        test_data: data
    }
    
    // Log test results to console
    let color_css = 'color:black;';
    if (test_score == TEST_SCORE['pass']) color_css = 'color:green;';
    if (test_score == TEST_SCORE['partial']) color_css = 'color:yellow;background-color:DarkGrey;';
    if (test_score == TEST_SCORE['fail']) color_css = 'color:red;';
    if (test_score == TEST_SCORE['error']) color_css = 'color:red;';
    console.log('%c' + node.name + ' ran test: ' + test_name, color_css);
    console.log(' Test duration: ' + test_duration + ' milliseconds')
    // console.log(' Test score: ' + translate_test_score_to_key(test_score));
    console.log(' Test results: ' + translate_test_score_to_string(test_score));
    console.log(' Test data:');
    console.dir(test_data);

    return test_data;
}

function node_api_test(node, test_name, api_promise, validation_function) {
    return new Promise(async (resolve, reject) => {
        let date_start = new Date();

        api_promise.then(function(response) {

            let test_score = validation_function(response.data);

            let date_complete = new Date();
            let test_duration = date_complete - date_start;

            resolve(node_test_complete(node, test_name, test_duration, test_score, response.data));
            return;
        })
        .catch(function(error) {
            console.error(error);

            let date_complete = new Date();
            let test_duration = date_complete - date_start;
            
            resolve(node_test_error(node, test_name, test_duration, error));
            return;
        });
    });
}

function node_api_test_version(node) {
    return node_api_test(node, 'node_api_test_version', node.api.version(), function(data) {
        if (data.status == 429 || data.requestsRemaining == 0) return TEST_SCORE['limited'];   // Too many requests
        if (data.error !== undefined) return TEST_SCORE['fail'];    // ex: {"error":"Action xyz not allowed"}
        if (data.status !== undefined) return TEST_SCORE['error'];  // HTTP status detected
        if (data.node_vendor === undefined && data.requestsLimit === undefined) return TEST_SCORE['fail'];
        if (data.node_vendor == CURRENT_NODE_VENDOR) return TEST_SCORE['pass'];
        return TEST_SCORE['partial'];
    });
}

function node_api_test_blocks(node) {
    return node_api_test(node, 'node_api_test_blocks', node.api.block_count(), function(data) {
        if (data.status == 429 || data.requestsRemaining == 0) return TEST_SCORE['limited'];   // Too many requests
        if (data.error !== undefined) return TEST_SCORE['fail'];    // ex: {"error":"Action xyz not allowed"}
        if (data.status !== undefined) return TEST_SCORE['error'];  // HTTP status detected
        if (data.unchecked === undefined && data.requestsLimit === undefined) return TEST_SCORE['fail'];
        if (Number(data.unchecked) > UNCHECKED_BLOCKS_FAIL) return TEST_SCORE['fail'];
        if (Number(data.unchecked) > UNCHECKED_BLOCKS_PARTIAL) return TEST_SCORE['partial'];
        return TEST_SCORE['pass'];
    });
}

function node_api_test_process(node) {
    const block = NodeAPI.block('send', TEST_INVALID_ACCOUNT, TEST_HASH, TEST_INVALID_ACCOUNT, '0', TEST_HASH, TEST_INVALID_ACCOUNT, TEST_SIGNATURE, TEST_WORK)
    return node_api_test(node, 'node_api_test_process', node.api.process(true, 'send', block), function(data) {
        if (data.status == 429 || data.requestsRemaining == 0) return TEST_SCORE['limited'];   // Too many requests
        if (data.status !== undefined) return TEST_SCORE['error'];  // HTTP status detected
        // This test is meant to fail, "Block is invalid"
        // if (data.error !== undefined) return TEST_SCORE['fail'];    // ex: {"error":"Action xyz not allowed"}
        if (data.hash === undefined && data.error === undefined && data.requestsLimit === undefined) return TEST_SCORE['fail'];
        if (data.error == 'Block is invalid') return TEST_SCORE['pass'];
        return TEST_SCORE['fail'];
    });
}

function node_api_test_work(node) {
    return node_api_test(node, 'node_api_test_work', node.api.work_generate(TEST_HASH), function(data) {
        if (data.status == 429 || data.requestsRemaining == 0) return TEST_SCORE['limited'];   // Too many requests
        if (data.error !== undefined) return TEST_SCORE['fail'];    // ex: {"error":"Action xyz not allowed"}
        if (data.status !== undefined) return TEST_SCORE['error'];  // HTTP status detected
        if (data.work === undefined && data.error === undefined && data.requestsLimit === undefined) return TEST_SCORE['fail'];
        if (data.work !== undefined) return TEST_SCORE['pass'];
        return TEST_SCORE['fail'];
    });
}

function node_api_test_token(node) {
    return node_api_test(node, 'node_api_test_token', node.api.block_count(), function(data) {
        if (data.status == 429 || data.requestsRemaining == 0) return TEST_SCORE['limited'];   // Too many requests
        if (data.error !== undefined) return TEST_SCORE['fail'];    // ex: {"error":"Action xyz not allowed"}
        if (data.status !== undefined) return TEST_SCORE['error'];  // HTTP status detected
        if (data.unchecked === undefined && data.requestsLimit === undefined) return TEST_SCORE['fail'];
        if (data.requestsLimit !== undefined) return TEST_SCORE['pass'];
        return TEST_SCORE['fail'];
    });
}

function node_api_test_receivable(node) {
    return node_api_test(node, 'node_api_test_receivable', node.api.receivable(TEST_VALID_ACCOUNT), function(data) {
        if (data.status == 429 || data.requestsRemaining == 0) return TEST_SCORE['limited'];   // Too many requests
        if (data.error !== undefined) return TEST_SCORE['fail'];    // ex: {"error":"Action xyz not allowed"}
        if (data.status !== undefined) return TEST_SCORE['error'];  // HTTP status detected
        if (data.blocks === undefined && data.requestsLimit === undefined) return TEST_SCORE['fail'];
        if (data.requestsLimit !== undefined) return TEST_SCORE['pass'];
        return TEST_SCORE['fail'];
    });
}

function node_websocket_test_setup(node) {
    return new Promise(async (resolve, reject) => {
        const date_start = new Date();
        const test_name = 'node_websocket_test_setup';
        try {
            let success = await node.websocket.setup_promise();
            let test_score = TEST_SCORE['fail'];
            if (success == true) {
                test_score = TEST_SCORE['pass'];
            }
            resolve(node_test_complete(node, test_name, (new Date() - date_start), test_score, {}));
            return;
        } catch(error) {
            resolve(node_test_error(node, test_name, (new Date() - date_start), error));
            return;
        }
    });
}

function node_websocket_test_ping(node) {
    return new Promise(async (resolve, reject) => {
        let date_start = new Date();
        const test_name = 'node_websocket_test_ping';
        try {
            let setup_success = await node.websocket.setup_promise();
            if (setup_success != true) {
                resolve(node_test_complete(node, test_name, (new Date() - date_start), TEST_SCORE['fail'], response.data));
                return;
            }
            date_start = new Date();
            node.websocket.ping((response) => {
                let test_score = TEST_SCORE['fail'];
                if (response.success == false && response.message !== undefined && response.data !== undefined && response.data.message === undefined) {
                    response.data.message = response.message;
                }
                if (response.success == true && response.data) test_score = TEST_SCORE['pass'];
                resolve(node_test_complete(node, test_name, (new Date() - date_start), test_score, response.data));
                return;
            });
        } catch(error) {
            resolve(node_test_error(node, test_name, (new Date() - date_start), error));
            return;
        }
    });
}

function node_websocket_test_subscribe_all(node) {
    return new Promise(async (resolve, reject) => {
        let date_start = new Date();
        const test_name = 'node_websocket_test_subscribe_all';
        try {
            let setup_success = await node.websocket.setup_promise();
            if (setup_success != true) {
                resolve(node_test_complete(node, test_name, (new Date() - date_start), TEST_SCORE['fail'], response.data));
                return;
            }
            date_start = new Date();
            node.websocket.subscribe_all((response) => {
                let test_score = TEST_SCORE['fail'];
                if (response.success == false && response.message !== undefined && response.data !== undefined && response.data.message === undefined) {
                    response.data.message = response.message;
                }
                if (response.success == true && response.data !== undefined && response.data.ack == 'subscribe'){
                    node.websocket.unsubscribe_all();
                    test_score = TEST_SCORE['pass'];
                }
                resolve(node_test_complete(node, test_name, (new Date() - date_start), test_score, response.data));
                return;
            });
        } catch(error) {
            resolve(node_test_error(node, test_name, (new Date() - date_start), error));
            return;
        }
    });
}

function node_websocket_test_subscribe_addresses(node) {
    return new Promise(async (resolve, reject) => {
        let date_start = new Date();
        const test_name = 'node_websocket_test_subscribe_addresses';
        try {
            let setup_success = await node.websocket.setup_promise();
            if (setup_success != true) {
                resolve(node_test_complete(node, test_name, (new Date() - date_start), TEST_SCORE['fail'], response.data));
                return;
            }
            date_start = new Date();
            node.websocket.subscribe_addresses([TEST_VALID_ACCOUNT], (response) => {
                let test_score = TEST_SCORE['fail'];
                if (response.success == false && response.message !== undefined && response.data !== undefined && response.data.message === undefined) {
                    response.data.message = response.message;
                }
                if (response.success == true && response.data !== undefined && response.data.ack == 'subscribe') {
                    test_score = TEST_SCORE['pass'];
                    node.websocket.unsubscribe_addresses([TEST_VALID_ACCOUNT]);
                }
                resolve(node_test_complete(node, test_name, (new Date() - date_start), test_score, response.data));
                return;
            });
        } catch(error) {
            resolve(node_test_error(node, test_name, (new Date() - date_start), error));
            return;
        }
    });
}