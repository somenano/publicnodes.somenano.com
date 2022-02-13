
window.table_data = [];

function update_table_test(node, results) {

    let updated = false;
    for (let i=0 ; i<window.table_data.length ; i++) {
        if (window.table_data[i].name == node.name) {
            updated = true;
            window.table_data[i][results.test_name] = results;
            break;
        }
    }

    if (!updated) {
        let data = {
            name: node.name,
            url: node.api.url,
            ws: (node.websocket === undefined ? undefined : node.websocket.url),
            comment: node.comment
        }
        // if (node.websocket) data.ws = node.websocket.url;
        data[results.test_name] = results;
        window.table_data.push(data);
    }

    $('#table').bootstrapTable('load', window.table_data);
}

function data_refresh() {

    for (let public_node of public_nodes) {

        let message_handler = undefined;
        // message_handler = function(data) {
        //     console.log('Message from '+ public_node.name);
        //     console.log(data);
        // }

        let node = new Node(public_node.name, public_node.url, public_node.ws, message_handler);
        node.comment = public_node.comment;

        ///////////////
        // node_api_test_version
        //
        node_api_test_version(node)
        .then((results) => {
            update_table_test(node, results);
        });

        ///////////////
        // node_api_test_blocks
        //
        node_api_test_blocks(node)
        .then((results) => {
            update_table_test(node, results);
        });

        ///////////////
        // node_api_test_process
        //
        node_api_test_process(node)
        .then((results) => {
            update_table_test(node, results);
        });

        ///////////////
        // node_api_test_receivable
        //
        node_api_test_receivable(node)
        .then((results) => {
            update_table_test(node, results);
        });

        ///////////////
        // node_api_test_work
        //
        node_api_test_work(node)
        .then((results) => {
            update_table_test(node, results);
        });

        ///////////////
        // node_api_test_token
        //
        node_api_test_token(node)
        .then((results) => {
            update_table_test(node, results);
        });

        if (node.websocket === undefined) continue;

        ///////////////
        // node_websocket_test_setup
        //
        node_websocket_test_setup(node)
        .then((results) => {
            update_table_test(node, results);
        });

        ///////////////
        // node_websocket_test_ping
        //
        node_websocket_test_ping(node)
        .then((results) => {
            update_table_test(node, results);
        });

        ///////////////
        // node_websocket_test_subscribe_all
        //
        node_websocket_test_subscribe_all(node)
        .then((results) => {
            update_table_test(node, results);
        });

        ///////////////
        node_websocket_test_subscribe_addresses
        
        node_websocket_test_subscribe_addresses(node)
        .then((results) => {
            update_table_test(node, results);
        });

    }
    
}
data_refresh();

async function test() {
    // var node = new Node(public_nodes[0].name, public_nodes[0].url, public_nodes[0].ws, (response) => {console.log(response);});  //Nano.cc
    // var node = new Node(public_nodes[1].name, public_nodes[1].url, public_nodes[1].ws, (response) => {console.log(response);}); // Vox
    var node = new Node(public_nodes[2].name, public_nodes[2].url, public_nodes[2].ws, (response) => {console.log(response);}); // Ninja
    console.log('node created');
    let success = await node.websocket.setup_promise();
    console.log('node setup (success: '+ success +')');
    // node.websocket.ping(function(response) { console.log('ping returned'); console.log(response); });
    node.websocket.subscribe_all((response) => { console.log('subscribe_all returned'); console.log(response); } );
    node.websocket.subscribe_addresses(['nano_3t6k35gi95xu6tergt6p69ck76ogmitsa8mnijtpxm9fkcm736xtoncuohr3'], (response) => {
        console.log('subscribe_addresses returned');
        console.log(response);
    });
}
// test();