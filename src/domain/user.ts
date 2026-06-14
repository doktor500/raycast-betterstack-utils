export interface User {
  first_name: string;
  last_name: string;
  email: string;
}

export function formatUserName(user: User): string {
  return `${user.first_name} ${user.last_name}`.trim() || user.email;
}

export function buildUserFromEmail(email: string): User {
  const name = email.split("@")[0] ?? email;
  const [firstName = name, ...lastNameParts] = name
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));

  return {
    first_name: firstName,
    last_name: lastNameParts.join(" "),
    email,
  };
}
