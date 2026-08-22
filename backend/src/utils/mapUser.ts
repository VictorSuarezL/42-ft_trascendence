export function mapFortyTwoUser(fortyTwoUser: any) {
  return {
    id: fortyTwoUser.id,
    login: fortyTwoUser.login,
    email: fortyTwoUser.email,
    firstName: fortyTwoUser.first_name,
    lastName: fortyTwoUser.last_name,
    displayName: fortyTwoUser.displayname,
    image: fortyTwoUser.image?.link ?? null,
  };
}
