import { inputElement, user, authLoginInput, autorizationForm, listElement } from "./api.js";
import { getFetchModule, postFetchModule, authFetch, regFetch } from "./api.js";
import { format } from 'date-fns';

const buttonAdd = document.getElementById('addButton');
const textareaElement = document.getElementById('commitInput');
const toAuthorizationButton = document.getElementById('toAuthorizationButton');
const notAuthorizedForm = document.getElementById('notAuthorized');
const regForm = document.getElementById('registration');
const regNameInput = document.getElementById('regName');
const regLoginInput = document.getElementById('regLogin');
const regPasswordInput = document.getElementById('regPassword');
const regBtn = document.getElementById('confirmRegBtn');
const authConfirmButton = document.getElementById('authorizationConfirmButton');
const toRegBtn = document.getElementById('toRegBtn');
const authPasswordInput = document.getElementById('passwordInput');
document.getElementById('notAuthorizednameInput').readOnly = true;
document.getElementById('notAuthorizedcommitInput').readOnly = true;
document.getElementById('nameInput').readOnly = true;
let comments = [];

toAuthorizationButton.disabled = true;
toAuthorizationButton.textContent = "Обработка...";
getFetch();

const initEventListener = () => {
    const likeButtonElements = document.querySelectorAll('.like-button');
    for (const likeButtonElement of likeButtonElements) {
        likeButtonElement.addEventListener('click', event => {
            event.stopPropagation();
            const index = likeButtonElement.dataset.index;
            if (user.name !== undefined) {
                if (!comments[index].isLiked) {
                    comments[index].likes++;
                    comments[index].isLiked = true;
                } else {
                    comments[index].likes--;
                    comments[index].isLiked = false;
                }
            } else {
                alert('Авторизуйтесь, чтобы поставить "Лайк"')
            };
            renderComments();
        });
    }
}

const renderComments = () => {
    const listElement = document.getElementById('list');
    const commentsHtml = comments.map((comment, index) => {
        return `<li class="comment">
      <div class="comment-header">
        <div class "commentName">${sanitizeHtml(comment.name)}</div>
        <div>${comment.date}</div>
      </div>
      <div class="comment-body">
        <div class="comment-text">
          ${sanitizeHtml(comment.text)}
        </div>
      </div>
      <div class="comment-footer">
        <div class="likes">
          <span class="likes-counter">
            <div>${comment.likes}</div>
          </span>
          <button class="${comment.isLiked ? 'like-button -active-like' : 'like-button'}" data-index =${index}>
            <div></div>
          </button>            
        </div>
      </div>
    </li>`
    }).join('');
    listElement.innerHTML = commentsHtml;

    initEventListener();
    commitAnswer();
};
renderComments();

buttonAdd.addEventListener('click', () => {
    const oldlistElement = listElement.innerHTML;
    if (inputElement.value === '' && textareaElement.value === '') {
        inputElement.style.backgroundColor = 'pink';
        textareaElement.style.backgroundColor = 'pink';
        return;
    } else if (inputElement.value === '') {
        inputElement.style.backgroundColor = 'pink';
        return;
    } else if (textareaElement.value === '') {
        textareaElement.style.backgroundColor = 'pink';
        return;
    } else {
        inputElement.style.backgroundColor = '';
        textareaElement.style.backgroundColor = '';
        postFetch();
    };
});

toAuthorizationButton.addEventListener('click', () => {
    listElement.style.display = 'none';
    notAuthorizedForm.style.display = 'none';
    autorizationForm.style.display = 'flex';
    location.hash = "#autorization";
});

authConfirmButton.addEventListener('click', () => {
    if (authLoginInput.value === '' && authPasswordInput.value === '') {
        authLoginInput.style.backgroundColor = 'pink';
        authPasswordInput.style.backgroundColor = 'pink';
        alert('Укажите Логин и Пароль')
        return;
    } else if (authLoginInput.value === '') {
        authLoginInput.style.backgroundColor = 'pink';
        alert('Укажите Логин')
        return;
    } else if (authPasswordInput.value === '') {
        authPasswordInput.style.backgroundColor = 'pink';
        alert('Укажите Пароль')
        return;
    };
    authFetch();
});

toRegBtn.addEventListener('click', () => {
    autorizationForm.style.display = 'none';
    regForm.style.display = 'flex';
});

regBtn.addEventListener('click', () => {
    if (regNameInput.value === '' || regLoginInput.value === '' || regPasswordInput.value === '') {
        alert('Заполните все поля')
        return;
    };
    regFetch()
        .then(
            alert('Регистрация прошла успешно. Используйте указанный при регистрации Логин и Пароль для авторизации.')
        );
    autorizationForm.style.display = 'flex';
    regForm.style.display = 'none';
});

function sanitizeHtml(htmlString) {
    return htmlString.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
};

function commitAnswer() {
    const commentsAnswer = document.querySelectorAll('.comment');
    const formText = document.querySelector('.add-form-text');
    commentsAnswer.forEach((comment, index) => {
        comment.addEventListener('click', () => {
            formText.value = `└> ${comments[index].name} \n ${comments[index].text}`;
        })
    })
};

function getFetch() {
    getFetchModule()
        .then((responseData) => {
            const appComments = responseData.comments.map((comment) => {
                return {
                    id: comment.id,
                    name: comment.author.name,
                    date: format(new Date(comment.date), "yyyy-MM-dd HH.mm.ss"),
                    text: comment.text,
                    likes: comment.likes,
                    isLiked: false,
                };
            });
            comments = appComments;
            renderComments();
        })
        .then(() => {
            toAuthorizationButton.disabled = false;
            toAuthorizationButton.textContent = "Авторизация";
            buttonAdd.disabled = false;
            buttonAdd.textContent = "Написать";
            inputElement.value = user.name;
            textareaElement.value = '';
        })
        .catch((error) => {
            toAuthorizationButton.disabled = false;
            toAuthorizationButton.textContent = "Авторизация";
            buttonAdd.disabled = false;
            buttonAdd.textContent = "Написать";
            inputElement.value = user.name;
            alert(error.message);
        });
};

function postFetch() {
    buttonAdd.disabled = true;
    buttonAdd.textContent = "Добавляем комментарий...";
    postFetchModule()
        .then((response) => {
            if (response.status === 400) {
                throw new Error('Имя или текст комментария короче 3-х символов');
            }
            if (response.status === 500) {
                throw new Error('Сервер покинул чат');
            }
        })
        .then(() => {
            getFetch()
        })
        .catch((error) => {
            buttonAdd.disabled = false;
            buttonAdd.textContent = "Написать";
            alert(error.message);
        });
};

console.log("It works!");
