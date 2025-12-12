document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const linkedin = document.getElementById('signupLinkedin').value;

            if (!username || !email || !password) {
                alert('Please fill in all required fields.');
                return;
            }

            let userProfile = {
                profilePicture: 'default-pic.png',
                username: username,
                fullName: username, 
                email: email,
                password: password,
                linkedin: linkedin,
                schoolHistory: {
                    college: '',
                    highschool: ''
                },
                lastWorkPosition: '',
                lastWorkExperience: '',
                skills: '',
                achievements: ''
            };

            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            localStorage.setItem('currentUserEmail', email);
            window.location.href = 'HomePage.html';
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail');
            const password = document.getElementById('loginPassword');
            const errorMessage = document.getElementById('errorMessage');

            const storedProfile = localStorage.getItem('userProfile');

            if (storedProfile) {
                const userProfile = JSON.parse(storedProfile);

                if (userProfile.email === email.value && userProfile.password === password.value) {
                    localStorage.setItem('currentUserEmail', email.value);
                    window.location.href = 'HomePage.html';
                } else {
                    email.value = '';
                    password.value = '';
                    errorMessage.textContent = 'Invalid email or password.';
                    errorMessage.classList.add('show');
                }
            } else {
                email.value = '';
                password.value = '';
                errorMessage.textContent = 'No account found. Please sign up first.';
                errorMessage.classList.add('show');
            }
        });
    }
});