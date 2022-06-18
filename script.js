import axios from "axios";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import prettyBytes from 'pretty-bytes';
let requestJsonBody = ace.edit("jsoninnerbody");
requestJsonBody.session.setMode("ace/mode/javascript");

requestJsonBody.setOptions({
    fontSize:'12pt',
    enableBasicAutoComplete:true
});

requestJsonBody.setValue('{}')
requestJsonBody.gotoLine(2);

const queryParamsContainer = document.querySelector('[data-query-params]');
const requestHeadersContainer = document.querySelector('[data-request-headers]');
const keyValueTemplate = document.querySelector('[data-key-value-template]');
const selectForm = document.querySelector('[data-form]');

document.querySelector("[data-add-query-param-btn]").addEventListener("click", () => {
    queryParamsContainer.append(createKeyValuePair());
})


document.querySelector("[data-add-request-header-btn]").addEventListener("click", () => {
    requestHeadersContainer.append(createKeyValuePair());
})

axios.interceptors.request.use(req => {
    req.customData = req.customData || {};
    req.customData.startTime = new Date().getTime();
    return req;
});


axios.interceptors.response.use(updateEndTime, e => {
    return Promise.reject(updateEndTime(e.response))
})

function updateEndTime(res) {
    res.customData = res.customData || {}
    res.customData.time = new Date().getTime() - res.config.customData.startTime;
    return res;
}

selectForm.addEventListener('submit', e => {
    e.preventDefault();
    var data = "";

    try{
data = JSON.parse(requestJsonBody.getValue() || null)
    }catch(e){
alert("Enter Valid Data")
    }

    axios({
        url: document.querySelector('[data-url]').value,
        method: document.querySelector('[data-method]').value,
        params: keyValuePairsToObject(queryParamsContainer),
        headers: keyValuePairsToObject(requestHeadersContainer),
        data
    })
        .catch(e => e)
        .then(response => {
            console.log(response)
            document.querySelector("[data-response-section]").classList.remove("d-none");
            updateResponseDetails(response);
            updateResponseEditor(response.data);
            updateResponseHeaders(response.headers);

        })
});

function updateResponseEditor(data){
    let responseJsonBody = ace.edit("response-body-inner");
    responseJsonBody.resize()
    responseJsonBody.setValue(JSON.stringify(data, null, 2))
    responseJsonBody.setReadOnly(true);
}


function updateResponseDetails(data) {
    document.querySelector('[data-status]').textContent = data.status
    document.querySelector('[data-time]').textContent = data.customData.time
    document.querySelector('[data-size]').textContent = prettyBytes(JSON.stringify(data.data).length + JSON.stringify(data.headers).length);

}


function updateResponseHeaders(headers) {
    let responseJsonHeader = ace.edit("response-headers-inner");
    responseJsonHeader.resize()
    responseJsonHeader.setValue(JSON.stringify(headers, null, 2))
    responseJsonHeader.setReadOnly(true);
}

function createKeyValuePair() {
    const element = keyValueTemplate.content.cloneNode(true);
    element.querySelector('[data-remove-btn]').addEventListener('click', (e) => {
        e.target.closest('[data-key-value-pair]').remove();
    })

    return element; ``
}

function keyValuePairsToObject(container) {
    const pairs = container.querySelectorAll('[data-key-value-pair]');
    return [...pairs].reduce((data, pair) => {
        const key = pair.querySelector('[data-key]').value;
        const value = pair.querySelector('[data-value]').value;
        if (key === '') return data;
        return { ...data, [key]: value }
    }, {})
}



