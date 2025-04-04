import type { Route } from "./+types/search";
import { useLoaderData } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export const loader = () => {
  console.log("test");
  return {data: "test"};
}

export default function Home() {
  const {data} = useLoaderData<typeof loader>();
  return <>{data}</>;
}
