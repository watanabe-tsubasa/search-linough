import { fetchHouses, fetchStores } from "~/lib/supabase/db"

const main = async () => {
  const stores = await fetchStores()
  const apartments = await fetchHouses('01050000017880')
  console.log(stores)
  console.log(apartments)
}

main().catch((error) => {
  console.error("Error in main function:", error)
});

