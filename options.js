function save_options() {
    let toggleAccounts = document.getElementById('toggleAccounts').value;
    let updateFrequency = document.getElementById('updateFrequency').value;
    // chrome.storage.sync.set({
    //     countAccounts: countAccounts,
    //     updateFrequency: updateFrequency
    // }, function() {
    //     chrome.extension.getBackgroundPage().window.location.reload();
    //     let status = document.getElementById('status');
    //     status.textContent = 'Options saved.';
    //     setTimeout(function() {
    //         status.textContent = '';
    //     }, 1500);
    // });

    localStorage.toggleAccounts = toggleAccounts;
    localStorage.updateFrequency = updateFrequency;
    chrome.extension.getBackgroundPage().window.location.reload();
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
        status.textContent = '';
    }, 1500);
}

function restore_options() {
    // chrome.storage.sync.get({
    //     countAccounts: '1',
    //     updateFrequency: '1'
    // }, function(items) {
    //     document.getElementById('countAccounts').value = items.countAccounts;
    //     document.getElementById('updateFrequency').value = items.updateFrequency;
    // });
    document.getElementById('toggleAccounts').value = localStorage.toggleAccounts;
    document.getElementById('updateFrequency').value = localStorage.updateFrequency;
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
