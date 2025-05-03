import { User } from "../store/types"

export const getFullName = (user: User) => {
  return `${user.first_name} ${user.last_name}`
}