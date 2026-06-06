/** 校验新密码与确认密码是否一致；通过返回 null，否则返回提示文案 */
export function validatePasswordConfirm(
  newPassword: string,
  confirmNewPassword: string,
): string | null {
  if (!confirmNewPassword.trim()) {
    return '请再次输入新密码';
  }
  if (newPassword !== confirmNewPassword) {
    return '两次密码不相同';
  }
  return null;
}
