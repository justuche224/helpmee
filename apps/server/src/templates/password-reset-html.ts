export function getErrorPageHTML(title: string, message: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - HelpMee</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8f9fa;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 48px 32px;
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        
        .error-icon {
          width: 64px;
          height: 64px;
          background-color: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        
        .title {
          color: #161616;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .message {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 32px;
        }
        
        .help-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 32px;
        }
        
        .help-icon {
          width: 20px;
          height: 20px;
          background-color: #8e9bae;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        }
        
        .help-text {
          color: #8e9bae;
          font-size: 16px;
        }
        
        .help-link {
          color: #22c55e;
          font-weight: 600;
          text-decoration: none;
        }
        
        @media (max-width: 480px) {
          .container {
            padding: 32px 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">!</div>
        <h1 class="title">${title}</h1>
        <p class="message">${message}</p>
        <div class="help-section">
          <div class="help-icon">?</div>
          <span class="help-text">
            Need help? <a href="#" class="help-link">Click Here</a>
          </span>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getResetPasswordFormHTML(token: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Set New Password - HelpMee</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8f9fa;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 48px 32px;
          max-width: 400px;
          width: 100%;
        }
        
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .title {
          color: #161616;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .subtitle {
          color: #a1a1a1;
          font-size: 16px;
          line-height: 1.5;
        }
        
        .form-group {
          margin-bottom: 16px;
          position: relative;
        }
        
        .form-group.last {
          margin-bottom: 32px;
        }
        
        .input {
          width: 100%;
          padding: 17px 21px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 16px;
          color: #161616;
          background: white;
          transition: border-color 0.2s ease;
        }
        
        .input:focus {
          outline: none;
          border-color: #22c55e;
        }
        
        .input::placeholder {
          color: #8e9bae;
        }
        
        .input.error {
          border-color: #ef4444;
        }
        
        .eye-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #8e9bae;
          font-size: 18px;
        }
        
        .submit-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #e2e8f0;
          color: #8e9bae;
        }
        
        .submit-btn.enabled {
          background-color: #22c55e;
          color: white;
        }
        
        .submit-btn.enabled:hover {
          background-color: #16a34a;
        }
        
        .submit-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .help-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 32px;
        }
        
        .help-icon {
          width: 20px;
          height: 20px;
          background-color: #8e9bae;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        }
        
        .help-text {
          color: #8e9bae;
          font-size: 16px;
        }
        
        .help-link {
          color: #22c55e;
          font-weight: 600;
          text-decoration: none;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 14px;
          margin-top: 8px;
        }
        
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .loading-content {
          background: white;
          border-radius: 10px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #22c55e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .loading-text {
          color: #161616;
          font-weight: 600;
        }
        
        @media (max-width: 480px) {
          .container {
            padding: 32px 24px;
          }
          
          .title {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">Set New Password</h1>
          <p class="subtitle">Must be at least 6 characters.</p>
        </div>
        
        <form id="resetForm">
          <input type="hidden" name="token" value="${token}">
          
          <div class="form-group">
            <input
              type="password"
              id="password"
              name="password"
              class="input"
              placeholder="Password"
              required
              minlength="6"
            >
            <button type="button" class="eye-toggle" onclick="togglePassword('password')">👀</button>
          </div>
          
          <div class="form-group last">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              class="input"
              placeholder="Confirm Password"
              required
              minlength="6"
            >
            <button type="button" class="eye-toggle" onclick="togglePassword('confirmPassword')">👀</button>
          </div>
          
          <div id="errorMessage" class="error-message" style="display: none;"></div>
          
          <button type="submit" id="submitBtn" class="submit-btn">
            Reset Password
          </button>
        </form>
        
        <div class="help-section">
          <div class="help-icon">?</div>
          <span class="help-text">
            Need help? <a href="#" class="help-link">Click Here</a>
          </span>
        </div>
      </div>
      
      <div id="loadingOverlay" class="loading-overlay">
        <div class="loading-content">
          <div class="spinner"></div>
          <span class="loading-text">Resetting password...</span>
        </div>
      </div>
      
      <script>
        const form = document.getElementById('resetForm');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const submitBtn = document.getElementById('submitBtn');
        const errorMessage = document.getElementById('errorMessage');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        function togglePassword(inputId) {
          const input = document.getElementById(inputId);
          const button = input.nextElementSibling;
          
          if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
          } else {
            input.type = 'password';
            button.textContent = '👀';
          }
        }
        
        function validateForm() {
          const password = passwordInput.value;
          const confirmPassword = confirmPasswordInput.value;
          
          const isValidPassword = password.length >= 6;
          const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
          const isFormValid = isValidPassword && passwordsMatch;
          
          if (isFormValid) {
            submitBtn.classList.add('enabled');
            submitBtn.disabled = false;
          } else {
            submitBtn.classList.remove('enabled');
            submitBtn.disabled = true;
          }
          
          if (confirmPassword.length > 0 && !passwordsMatch) {
            confirmPasswordInput.classList.add('error');
            showError('Passwords do not match');
          } else {
            confirmPasswordInput.classList.remove('error');
            hideError();
          }
          
          if (password.length > 0 && !isValidPassword) {
            passwordInput.classList.add('error');
            showError('Password must be at least 6 characters');
          } else if (password.length > 0) {
            passwordInput.classList.remove('error');
          }
        }
        
        function showError(message) {
          errorMessage.textContent = message;
          errorMessage.style.display = 'block';
        }
        
        function hideError() {
          errorMessage.style.display = 'none';
        }
        
        passwordInput.addEventListener('input', validateForm);
        confirmPasswordInput.addEventListener('input', validateForm);
        
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData(form);
          const password = formData.get('password');
          const confirmPassword = formData.get('confirmPassword');
          const token = formData.get('token');
          
          if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
          }
          
          if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
          }
          
          loadingOverlay.style.display = 'flex';
          
          try {
            const response = await fetch('/v1/auth/reset-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                newPassword: password,
                token: token,
              }),
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
              window.location.href = '/v1/auth/reset-password/success';
            } else {
              throw new Error(result.message || 'Failed to reset password');
            }
          } catch (error) {
            loadingOverlay.style.display = 'none';
            showError(error.message || 'Failed to reset password. Please try again.');
          }
        });
        
        validateForm();
      </script>
    </body>
    </html>
  `;
}

export function getSuccessPageHTML({
  heading,
  message,
  helpLink,
}: {
  heading: string;
  message: string;
  helpLink: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Successful - HelpMee</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8f9fa;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 48px 32px;
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        
        .success-icon {
          width: 64px;
          height: 64px;
          background-color: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        
        .title {
          color: #161616;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .message {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 32px;
        }
        
        .help-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 32px;
        }
        
        .help-icon {
          width: 20px;
          height: 20px;
          background-color: #8e9bae;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        }
        
        .help-text {
          color: #8e9bae;
          font-size: 16px;
        }
        
        .help-link {
          color: #22c55e;
          font-weight: 600;
          text-decoration: none;
        }
        
        @media (max-width: 480px) {
          .container {
            padding: 32px 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✓</div>
        <h1 class="title">${heading}</h1>
        <p class="message">
          ${message}
        </p>
        <div class="help-section">
          <div class="help-icon">?</div>
          <span class="help-text">
            Need help? <a href="${helpLink}" class="help-link">Click Here</a>
          </span>
        </div>
      </div>
    </body>
    </html>
  `;
}
