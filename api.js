export const inputElement = document.getElementById('nameInput');
export const textareaElement = document.getElementById('commitInput');
export const authLoginInput = document.getElementById('loginInput');
export const autorizationForm = document.getElementById('autorization');
export const listElement = document.getElementById('list');

const passwordArea = document.getElementById('passwordInput');
const authorizedForm = document.getElementById('authorizedAddForm');

export let user = [];

export const host = "https://wedev-api.sky.pro/api/v2/:aleksandr-penkov/comments";
export const authHost = "https://wedev-api.sky.pro/api/user";

export function getFetchModule() {
    return fetch(host, {
        method: "GET",
    })
        .then((response) => {
            return response.json()
        })
};

export function postFetchModule() {
    return fetch(host, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
            text: textareaElement.value
                .replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
            name: inputElement.value
                .replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
        })
    })
}

export function authFetch() {
    return fetch(authHost + '/login', {
        method: "POST",
        body: JSON.stringify({
            login: authLoginInput.value,
            password: passwordArea.value
        })
    })
        .then((response) => {
            if (response.status === 400) {
                throw new Error('Неверное имя пользователя или пароль')
            }
            return response.json();
        })
        .then((responseData) => {
            user = responseData.user;
            inputElement.value = user.name;
        })
        .then(() => {
            autorizationForm.style.display = 'none';
            listElement.style.display = 'flex';
            authorizedForm.style.display = 'flex';
        })
        .catch((error) => {
            alert(error.message);
        });
}

export function regFetch() {
    return fetch(authHost, {
        method: "POST",
        body: JSON.stringify({
            login: document.getElementById('regLogin').value,
            password: document.getElementById('regPassword').value,
            name: document.getElementById('regName').value
        })
    })
        .then((response) => {
            if (response.status === 400) {
                throw new Error('Пользователь с таким логином уже существует')
            }
        })
        .then((response) => {
            response.json();
        })
        .catch((error) => {
            alert(error.message);
        });
}
