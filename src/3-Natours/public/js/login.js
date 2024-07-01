

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};

const showAlert = (type, msg) => {
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:8000/api/v1/users/login`,
      data: { email, password },
    })

    if (res.data.status === 'success') {
      // alert("logged in successfully");
      showAlert("success", "logged in successfully");

      window.setTimeout(() => {
        location.assign('/');
      }, 1500)
    }

    console.log(res);
  } catch (error) {
    // console.log(error.response.data.message);
    // alert(error.response.data.message);
    showAlert('error', error.response.data.message || 'Error logging in');
  }
}

const logout = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/v1/users/logout');

    if (res.data.status === 'success') {
      showAlert("success", "Logged out successfully");

      window.setTimeout(() => {
        location.assign('/login');
      }, 500)
    }

  } catch (error) {
    let errorMessage = 'An error occurred';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    showAlert('error', errorMessage);
  }
};

// Type is either password or data
const updateSettings = async (data, type) => {
  try {

    const URL = type === 'password'
      ? `http://127.0.0.1:8000/api/v1/users/updateMyPassword`
      : `http://127.0.0.1:8000/api/v1/users/updateMe`

    const res = await axios(
      { method: 'PATCH', url: URL, data: data }
    )

    if (res.data.status === 'success') {
      showAlert("success", `${type.toUpperCase()} update successfully`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message || 'Error while updating');
  }
}


const loginForm = document.querySelector('.form.form--login');
const logoutButton = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // updateSettings({ name, email }, "data");

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log(form);

    updateSettings(form, "data");
  });
}

// if (userPasswordForm) {
//   userPasswordForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     document.querySelector('.btn--save--password').textContent = 'Updating...';

//     const passwordCurrent = document.getElementById('password-current').value;
//     const password = document.getElementById('password').value;
//     const passwordConfirm = document.getElementById('password-confirm').value;

//     await updateSettings({ passwordCurrent, password, passwordConfirm }, "password");


//     document.querySelector('.btn--save--password').textContent = 'Save password';

//     document.getElementById('password-current').value = ""
//     document.getElementById('password').value = ""
//     document.getElementById('password-confirm').value = ""

//   });
// }

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save--password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings({ passwordCurrent, password, passwordConfirm }, "password");

    document.querySelector('.btn--save--password').textContent = 'Save password';

    document.getElementById('password-current').value = ""
    document.getElementById('password').value = ""
    document.getElementById('password-confirm').value = ""
  });

  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      const icon = button.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}
