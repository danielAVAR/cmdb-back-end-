export default class UserDto {
  constructor(data) {
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
  }
}
