function validateUsername(username) {
    const regex = /^[a-zA-Z]{3}[a-zA-Z0-9_-]{0,13}$/;
    return regex.test(username) ? '' : 'Неверный ввод логина';
  }
  
  function validatePassword(password) {
    if (password.length < 7) {
      return 'Неверный ввод пароля';
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasUpperCase && hasNumber ? '' : 'Неверный ввод пароля';
  }
  
  
  function validatePhoneNumber(phoneNumber) {
    const regex = /^\+375(?:17|25|29|33|44)\d{7}$/;
    return regex.test(phoneNumber) ? '' : 'Неверный ввод номера';
  }

  function validateFullName(fullName) {
    const regex = /^[А-Яа-я]+\s[А-Яа-я]+\s[А-Яа-я]+$/;
    return regex.test(fullName) ? '' : 'Неверный ввод ФИО';
  }

  module.exports = {
    validateUsername,
    validatePassword,
    validateFullName,
    validatePhoneNumber,
  };