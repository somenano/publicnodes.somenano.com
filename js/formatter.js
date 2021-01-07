function formatter_name(value, row, index) {
    if (value === undefined) return undefined;
    let ret = '<div>' + value + '</div>';
    ret += '<div class="tiny-muted"><a href="' + row.url + '">API</a>';
    if (row.ws !== undefined) ret += '<br><a href="' + row.ws + '">WebSocket</a>';
    ret += '</div>';
    return ret;
}

function formatter_node_api_test_version(value, row, index) {
    if (value === undefined) return undefined;
    if (value.test_score == TEST_SCORE['error']) {
        return '<div class="fs-0-7">Error' + (value.test_duration !== undefined ? '</div><div class="tiny-muted">' + value.test_duration + ' ms' : '') + '</div>';
    }
    return '<div class="fs-0-7">' + value.test_data.node_vendor + '</div><div class="tiny-muted">' + value.test_duration + ' ms</div>';
}

function formatter_node_api_test_blocks(value, row, index) {
    if (value === undefined) return undefined;
    if (value.test_score == TEST_SCORE['error']) {
        return '<div class="fs-0-7">Error' + (value.test_duration !== undefined ? '</div><div class="tiny-muted">' + value.test_duration + ' ms' : '') + '</div>';
    }
    let ret = '<div class="fs-0-7">Count: ' + (value.test_data.count !== undefined ? value.test_data.count : 'Unknown');
    ret += '<br>Unchecked: ' + (value.test_data.unchecked !== undefined ? value.test_data.unchecked : 'Unknown');
    ret += '<br>Uncemented: ' + (value.test_data.cemented !== undefined && value.test_data.count !== undefined ? value.test_data.count - value.test_data.cemented : 'Unknown') + '</div>';
    ret += '<div class="tiny-muted">' + value.test_duration + ' ms</div>';
    return ret;
}

function formatter_node_api_test_process(value, row, index) {
    if (value === undefined) return undefined;
    if (value.test_score == TEST_SCORE['error']) {
        return '<div class="fs-0-7">Error' + (value.test_duration !== undefined ? '</div><div class="tiny-muted">' + value.test_duration + ' ms' : '') + '</div>';
    }
    
    let ret = '<div class="fs-0-7">';
    if (value.test_score == TEST_SCORE['pass']) ret += 'True';
    else ret += 'False';
    ret += '</div><div class="tiny-muted">' + value.test_duration + ' ms</div>';
    return ret;
}

function formatter_node_api_test_work(value, row, index) {
    if (value === undefined) return undefined;
    if (value.test_score == TEST_SCORE['error']) {
        return '<div class="fs-0-7">Error' + (value.test_duration !== undefined ? '</div><div class="tiny-muted">' + value.test_duration + ' ms' : '') + '</div>';
    }

    let ret = '<div class="fs-0-7">';
    if (value.test_score == TEST_SCORE['pass']) ret += 'True';
    else ret += 'False';
    ret += '</div><div class="tiny-muted">' + value.test_duration + ' ms</div>';
    return ret;
}

function formatter_node_api_test_token(value, row, index) {
    if (value === undefined) return undefined;
    if (value.test_score == TEST_SCORE['error']) {
        return '<div>Error' + (value.test_duration !== undefined ? '</div><div class="tiny-muted">' + value.test_duration + ' ms' : '') + '</div>';
    }

    let ret = '<div class="fs-0-7">';
    if (value.test_score == TEST_SCORE['pass']) ret += '' + value.test_data.requestsLimit + ' tokens';
    else ret += 'No tokens detected';
    ret += '</div><div class="tiny-muted">' + value.test_duration + ' ms</div>';
    return ret;
}


///////////// Cell styles

function test_cell_style(value, row, index) {
    const no_color = [
        'node_api_test_token',
    ]

    if (value === undefined) return {};

    if (value.test_score == TEST_SCORE['error']) {
        return {
            classes: 'table-danger text-center',
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
    return {}
}

function name_cell_style(value, row, index) {
    return {
        classes: 'text-center'
    }
}