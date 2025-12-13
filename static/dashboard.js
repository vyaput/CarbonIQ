document.addEventListener('DOMContentLoaded', () => {
    const welcomeUsernameSpan = document.getElementById('welcomeUsername');
    const headerProfilePic = document.getElementById('headerProfilePic');

    const storedProfile = localStorage.getItem('userProfile');
    let userProfile = null;

    if (storedProfile) {
        userProfile = JSON.parse(storedProfile);
        if (welcomeUsernameSpan) {
            welcomeUsernameSpan.textContent = userProfile.username;
        }
        if (headerProfilePic) {
            const picSrc = userProfile.profilePicture;
            headerProfilePic.src = picSrc;

            headerProfilePic.onerror = () => {
                headerProfilePic.src = '/static/default-pic.png';
            };
        }
    } 
    else {
        if (welcomeUsernameSpan) {
            welcomeUsernameSpan.textContent = 'Guest';
        }
        const profileLink = document.querySelector('.profile-icon');
        if (profileLink) {
            profileLink.href = 'login.html';
            profileLink.classList.add('no_account');
            profileLink.textContent = 'Sign In';
        }
    }
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else if (currentPath === 'HomePage.html' && link.textContent === 'Home') {
            link.classList.add('active');
        }
    });
});
