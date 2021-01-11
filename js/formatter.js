function formatter_name(value, row, index) {
    if (value === undefined) return undefined;
    let ret = '<div>' + value + '</div>';
    ret += '<div class="tiny-muted"><a href="' + row.url + '">API</a>';
    if (row.ws !== undefined) ret += '<br><a href="' + row.ws + '">WebSocket</a>';
    ret += '</div>';
    return ret;
}

function formatter_comment(value, row, index) {
    if (value === undefined) return undefined;
    let ret = '<div class="fs-0-7">' + value + '</div>';
    return ret;
}

function error_message(value) {
    let ret = '<div class="fs-0-7">Error</div>';
    
    if (value.test_data.timeout !== undefined && value.test_duration !== undefined && value.test_data.status == 0 && value.test_data.timeout <= value.test_duration) {
        ret += '<div class="fs-0-5">Test timed out</div>';
    }
    else if (value.test_data.status == 500) {
        // Check for error or message property in responseText
        try {
            let data = JSON.parse(value.test_data.responseText);
            if (data.error !== undefined) ret += '<div class="fs-0-5">' + data.error + '</div>';
            else if (data.message !== undefined) ret += '<div class="fs-0-5">' + data.message + '</div>';
            else throw 'no message';
        } catch(e) {
            // Unable to parse message
            ret += '<div class="fs-0-5">Returned HTTP 500</div>';
        }
    } else {
        ret += '<div class="fs-0-5">Returned HTTP ' + value.test_data.status + '</div>';
    }


    if (value.test_duration !== undefined) {
        ret += '<div class="tiny-muted">' + value.test_duration + ' ms';
    }
    return ret;
}

function limited_message(value) {
    return '<div class="fs-0-7">This node is rate limiting your requests, try again later</div>';
}

function running_test_message(value) {
    return '<div class="text-center"><img src="/images/nano.gif" height="32px" width="43px"></div><div class="text-center tiny-muted">Running test...</div>';
}

function results_true_false_message(value) {
    let ret = '<div class="fs-0-7">';
    if (value.test_score == TEST_SCORE['pass']) ret += 'Pass';
    else ret += 'Fail';
    ret += '</div>';
    if (value.test_data.message !== undefined) ret += '<div class="fs-0-5">'+ value.test_data.message +'</div>';
    ret += '<div class="tiny-muted">' + value.test_duration + ' ms</div>';
    return ret;
}

function formatter_node_api_test_version(value, row, index) {
    if (value === undefined) return running_test_message(value);
    if (value.test_score == TEST_SCORE['error']) {
        return error_message(value);
    }
    if (value.test_score == TEST_SCORE['limited']) {
        return limited_message(value);
    }

    return '<div class="fs-0-7">' + value.test_data.node_vendor + '</div><div class="tiny-muted">' + value.test_duration + ' ms</div>';
}

function formatter_node_api_test_blocks(value, row, index) {
    if (value === undefined) return running_test_message(value);
    if (value.test_score == TEST_SCORE['error']) {
        return error_message(value);
    }
    if (value.test_score == TEST_SCORE['limited']) {
        return limited_message(value);
    }

    let ret = '<div class="fs-0-7">Count: ' + (value.test_data.count !== undefined ? value.test_data.count : 'Unknown');
    ret += '<br>Unchecked: ' + (value.test_data.unchecked !== undefined ? value.test_data.unchecked : 'Unknown');
    ret += '<br>Uncemented: ' + (value.test_data.cemented !== undefined && value.test_data.count !== undefined ? value.test_data.count - value.test_data.cemented : 'Unknown') + '</div>';
    ret += '<div class="tiny-muted">' + value.test_duration + ' ms</div>';
    return ret;
}

function formatter_node_api_test_process(value, row, index) {
    if (value === undefined) return running_test_message(value);
    if (value.test_score == TEST_SCORE['error']) {
        return error_message(value);
    }
    if (value.test_score == TEST_SCORE['limited']) {
        return limited_message(value);
    }
    
    return results_true_false_message(value);
}

function formatter_node_api_test_work(value, row, index) {
    if (value === undefined) return running_test_message(value);
    if (value.test_score == TEST_SCORE['error']) {
        return error_message(value);
    }
    if (value.test_score == TEST_SCORE['limited']) {
        return limited_message(value);
    }

    return results_true_false_message(value);
}

function formatter_node_api_test_token(value, row, index) {
    if (value === undefined) return running_test_message(value);
    if (value.test_score == TEST_SCORE['error']) {
        return error_message(value);
    }
    if (value.test_score == TEST_SCORE['limited']) {
        return limited_message(value);
    }

    let ret = '<div class="fs-0-7">';
    if (value.test_score == TEST_SCORE['pass']) ret += '' + value.test_data.requestsLimit + ' tokens';
    else ret += 'No tokens detected';
    ret += '</div><div class="tiny-muted">' + value.test_duration + ' ms</div>';
    return ret;
}

function formatter_node_websocket_test_setup(value, row, index) {
    if (row.ws === undefined) return undefined;
    if (value === undefined) return running_test_message(value);
    if (value.test_score == TEST_SCORE['error']) {
        return error_message(value);
    }
    if (value.test_score == TEST_SCORE['limited']) {
        return limited_message(value);
    }

    return results_true_false_message(value);
}

function formatter_node_websocket_test_ping(value, row, index) {
    if (row.ws === undefined) return undefined;
    if (value === undefined) return running_test_message(value);
    if (value.test_score == TEST_SCORE['error']) {
        return error_message(value);
    }
    if (value.test_score == TEST_SCORE['limited']) {
        return limited_message(value);
    }

    return results_true_false_message(value);
}

function formatter_node_websocket_test_subscribe_all(value, row, index) {
    if (row.ws === undefined) return undefined;
    if (value === undefined) return running_test_message(value);
    if (value.test_score == TEST_SCORE['error']) {
        return error_message(value);
    }
    if (value.test_score == TEST_SCORE['limited']) {
        return limited_message(value);
    }

    return results_true_false_message(value);
}

function formatter_node_websocket_test_subscribe_addresses(value, row, index) {
    if (row.ws === undefined) return undefined;
    if (value === undefined) return running_test_message(value);
    if (value.test_score == TEST_SCORE['error']) {
        return error_message(value);
    }
    if (value.test_score == TEST_SCORE['limited']) {
        return limited_message(value);
    }

    return results_true_false_message(value);
}


///////////// Cell styles

function test_cell_style(value, row, index) {
    const no_color = [
        'node_api_test_token',
    ]

    if (value === undefined) return {
        classes: 'text-center',
    };

    if (value.test_score == TEST_SCORE['error']) {
        return {
            classes: 'table-danger text-center',
        }
    }

    if (value.test_score == TEST_SCORE['limited']) {
        return {
            classes: 'text-center',
        }
    }

    // Do not format these unless error
    if (no_color.indexOf(value.test_name) >= 0) {
        return {
            classes: 'text-center'
        };
    }

    if (value.test_score == TEST_SCORE['fail']) {
        return {
            classes: 'table-danger text-center',
        }
    }
    if (value.test_score == TEST_SCORE['partial']) {
        return {
            classes: 'table-warning text-center',
        }
    }
    if (value.test_score == TEST_SCORE['pass']) {
        return {
            classes: 'table-success text-center',
        }
    }
    return {
        classes: 'text-center',
    }
}

function name_cell_style(value, row, index) {
    return {
        classes: 'text-center'
    }
}