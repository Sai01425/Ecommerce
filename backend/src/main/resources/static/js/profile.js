/**
 * User Profile Management
 */

document.addEventListener('DOMContentLoaded', () => {
  if (requireAuth('profile.html')) {
    loadProfile();
    setupProfileForms();
  }
});

async function loadProfile() {
  try {
    const res = await apiRequest('/users/me');
    const user = res.data;

    document.getElementById('profileNameDisplay').textContent = user.name;
    document.getElementById('profileEmailDisplay').textContent = user.email;
    document.getElementById('profileRoleBadge').textContent = user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Customer';
    document.getElementById('profileRoleBadge').className = user.role === 'ROLE_ADMIN' ? 'badge bg-danger' : 'badge bg-primary';

    // Form inputs
    document.getElementById('editName').value = user.name;
    document.getElementById('editPhone').value = user.phone || '';

    // Update localStorage user cache
    localStorage.setItem('user', JSON.stringify(user));
    updateNavUser();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function setupProfileForms() {
  const profileForm = document.getElementById('editProfileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('editName').value.trim();
      const phone = document.getElementById('editPhone').value.trim();

      try {
        const res = await apiRequest('/users/me', {
          method: 'PUT',
          body: JSON.stringify({ name, phone })
        });
        showToast('Profile information updated!', 'success');
        loadProfile();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  const passwordForm = document.getElementById('changePasswordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('editName').value.trim();
      const phone = document.getElementById('editPhone').value.trim();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmNewPassword = document.getElementById('confirmNewPassword').value;
      const alertBox = document.getElementById('passwordAlert');

      if (alertBox) alertBox.classList.add('d-none');

      if (newPassword !== confirmNewPassword) {
        if (alertBox) {
          alertBox.textContent = 'New passwords do not match';
          alertBox.classList.remove('d-none');
        }
        return;
      }

      if (newPassword.length < 6) {
        if (alertBox) {
          alertBox.textContent = 'New password must be at least 6 characters';
          alertBox.classList.remove('d-none');
        }
        return;
      }

      try {
        await apiRequest('/users/me', {
          method: 'PUT',
          body: JSON.stringify({ name, phone, currentPassword, newPassword })
        });
        showToast('Password changed successfully!', 'success');
        passwordForm.reset();
      } catch (err) {
        if (alertBox) {
          alertBox.textContent = err.message || 'Failed to update password';
          alertBox.classList.remove('d-none');
        }
      }
    });
  }
}
