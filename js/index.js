
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
            url: node.url,
            ws: node.ws,
            comment: node.comment
        }
        data[results.test_name] = results;
        window.table_data.push(data);
    }

    $('#table').bootstrapTable('load', window.table_data);
}

function data_refresh() {

    for (let public_node of public_nodes) {

        let node = new Node(public_node.name, public_node.url, public_node.ws);

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

    }
    
}
data_refresh();