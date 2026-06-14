import { capitalize } from "@/common/utils/string-utils";

export interface User {
  first_name: string;
  email: string;
}

export function formatUserName(user: User): string {
  return `${user.first_name}`.trim() ?? user.email;
}

export function buildUserFromEmail(email: string): User {
  const first_name = capitalize(email.split("@")[0] ?? email);

  return {
    first_name,
    email,
  };
}
