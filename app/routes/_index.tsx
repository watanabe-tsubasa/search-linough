import { redirect } from "react-router"

export const loader = () => {
  return redirect('/search')
}

export default function Main() {
  return null;
}