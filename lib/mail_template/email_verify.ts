export function verificationEmailTemplate(code: string, email: string, password: string): string {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #0e7490;">Verify Your Email</h2>
      <p>Use the verification code below to complete your signup or verification process:</p>
      <div style="font-size: 24px; font-weight: bold; margin: 20px 0; background: #f0f0f0; padding: 10px 20px; display: inline-block;">
        ${code}
      </div>
      <p>This code will expire in 10 minutes.</p>

      <h3 style="margin-top: 30px; color: #0e7490;">Login Credentials</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>

      <p style="margin-top: 30px;">If you did not request this, please ignore this message.</p>
      <hr style="margin: 30px 0;" />
      <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
    </div>
  `;
}
