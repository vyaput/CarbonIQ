document.addEventListener('DOMContentLoaded', () => {
    const headerProfilePic = document.getElementById('headerProfilePic');
    const profilePictureDisplay = document.getElementById('profilePictureDisplay');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const uploadPicBtn = document.getElementById('uploadPicBtn');
    const profileFullNameDisplay = document.getElementById('profileFullNameDisplay');
    const profileUsernameDisplay = document.getElementById('profileUsernameDisplay');

    const profileForm = document.getElementById('profileForm');
    const usernameInput = document.getElementById('username');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const editProfileBtn = document.getElementById('editProfileBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const logoutBtn = document.getElementById('logoutBtn'); 

    let userProfile = {};

    const loadProfileData = () => {
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
            userProfile = JSON.parse(storedProfile);
        } else {
            alert('No profile data found. Please sign up or log in.');
            window.location.href = '/login';
            return;
        }
        renderProfile();
        setFormReadonly(true);
    };

    const renderProfile = () => {
        headerProfilePic.src = userProfile.profilePicture || '/static/default-profile.png';
        profilePictureDisplay.src = userProfile.profilePicture || '/static/default-profile.png';
        profileFullNameDisplay.textContent = userProfile.fullName || 'No Name';
        profileUsernameDisplay.textContent = `@${userProfile.username || 'unknown'}`;
        usernameInput.value = userProfile.username || '';
        fullNameInput.value = userProfile.fullName || '';
        emailInput.value = userProfile.email || '';
        passwordInput.value = "********";
    };

    const setFormReadonly = (isReadonly) => {
        const inputs = profileForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.id !== 'password') {
                input.readOnly = isReadonly;
            }
        });

        if (isReadonly) {
            editProfileBtn.style.display = 'block';
            saveProfileBtn.style.display = 'none';
            cancelEditBtn.style.display = 'none';
            uploadPicBtn.style.display = 'none';
            changePasswordBtn.style.display = 'none';
        } else {
            editProfileBtn.style.display = 'none';
            saveProfileBtn.style.display = 'block';
            cancelEditBtn.style.display = 'block';
            uploadPicBtn.style.display = 'block';
            changePasswordBtn.style.display = 'inline-block';
        }
    };

    const handleProfilePicUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                userProfile.profilePicture = e.target.result;
                saveProfileData();
                renderProfile();
            };
            reader.readAsDataURL(file);
        }
    };

    const saveProfileData = () => {
        userProfile.username = usernameInput.value;
        userProfile.fullName = fullNameInput.value;
        userProfile.email = emailInput.value;

        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    };

    editProfileBtn.addEventListener('click', () => {
        setFormReadonly(false);
    });

    cancelEditBtn.addEventListener('click', () => {
        loadProfileData();
        setFormReadonly(true);
    });

    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (confirm("Are you sure you want to save these changes?")) {
            saveProfileData();
            renderProfile();
            setFormReadonly(true);
            alert("Profile updated successfully!");
        }
    });

    uploadPicBtn.addEventListener('click', () => {
        profilePictureInput.click();
    });

    profilePictureInput.addEventListener('change', handleProfilePicUpload);

    changePasswordBtn.addEventListener('click', () => {
        const currentPassword = prompt("Please enter your current password:");
        if (currentPassword === null) {
            return;
        }

        if (currentPassword === userProfile.password) {
            const newPassword = prompt("Enter your new password:");
            if (newPassword === null) {
                return;
            }

            if (newPassword.length < 6) {
                alert("New password must be at least 6 characters long.");
                return;
            }

            const confirmNewPassword = prompt("Confirm your new password:");
            if (confirmNewPassword === null) {
                return;
            }

            if (newPassword === confirmNewPassword) {
                userProfile.password = newPassword;
                saveProfileData();
                alert("Password changed successfully!");
                renderProfile();
            } else {
                alert("New passwords do not match.");
            }
        } else {
            alert("Incorrect current password.");
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to log out? Your local profile data will be cleared.")) {
                localStorage.removeItem('userProfile');
                localStorage.removeItem('currentUserEmail');
                sessionStorage.clear();

                alert("You have been logged out. Local data cleared.");
                window.location.href = '/';
            }
        });
    }

    loadProfileData();

    const dayList = document.getElementById('day-list');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultDiv = document.getElementById('result');

    let dailyCarbon = JSON.parse(localStorage.getItem('carbonData')) || [];

    function updateProfileList() {
        if (!dayList) return;
        dayList.innerHTML = '';

        if (dailyCarbon.length === 0) {
            dayList.innerHTML = '<li style="justify-content:center;">No days added yet. Go to Calculator to add entries!</li>';
            if(analyzeBtn) analyzeBtn.style.display = 'none';
            if(resetBtn) resetBtn.style.display = 'none';
        } else {
            dailyCarbon.forEach((val, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span><strong>Day ${index + 1}</strong></span> <span>${val.toFixed(2)} kg CO2</span>`;
                dayList.appendChild(li);
            });

            if(resetBtn) resetBtn.style.display = 'block';
            
            if (dailyCarbon.length >= 2) {
                if(analyzeBtn) analyzeBtn.style.display = 'block';
            } else {
                if(analyzeBtn) analyzeBtn.style.display = 'none';
            }
        }
    }

    updateProfileList();

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            resultDiv.innerHTML = "<p style='text-align:center; font-size:1.2em;'>Analyzing trend with AI...</p>";
            try {
                const response = await fetch('/analyze_trend', {method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ daily_data: dailyCarbon })
                });

                const data = await response.json();

                if(data.success) {
                    let imgHtml = '';
                    if (data.plot_image) {
                        imgHtml = `<img src="data:image/png;base64,${data.plot_image}" style="width:100%; border-radius:10px; margin-top:20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">`;
                    }
                    
                    resultDiv.innerHTML = `
                        <div>
                            <h3>Carbon Trend Analysis</h3>
                            <p style="font-size: 1.3em; margin: 10px 0;"><strong>Total Emission:</strong> ${data.total_kg} kg CO2</p>
                            ${imgHtml}
                        </div>
                    `;
                } else {
                    resultDiv.innerHTML = `<p style="color:red; text-align:center;">Error: ${data.message}</p>`;
                }            
            } catch (error) {
                console.error(error);
                resultDiv.innerHTML = "<p style='color:red; text-align:center;'>Connection Failed. Is the server running?</p>";
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete all daily entries? This cannot be undone.")) {
                dailyCarbon = [];
                localStorage.removeItem('carbonData');
                resultDiv.innerHTML = "";
                updateProfileList();
            }
        });
    }
});