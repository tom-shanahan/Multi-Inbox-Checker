function save_options() {
    let toggleAccounts = document.getElementById('toggleAccounts').value;
    let updateFrequency = document.getElementById('updateFrequency').value;
    let toggleFrequency = document.getElementById('toggleFrequency').value;

    localStorage.toggleAccounts = toggleAccounts;
    localStorage.updateFrequency = updateFrequency;
    localStorage.toggleFrequency = toggleFrequency;
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
        status.textContent = '';
    }, 1500);
}

function restore_options() {
    document.getElementById('toggleAccounts').value = localStorage.toggleAccounts;
    document.getElementById('updateFrequency').value = localStorage.updateFrequency;
    document.getElementById('toggleFrequency').value = localStorage.toggleFrequency;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
