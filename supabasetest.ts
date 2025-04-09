import { fetchHouses, fetchHousesPromise, fetchStores, fetchStoresPromise } from "~/lib/supabase/db"

const main = async () => {
  const {stores} = await fetchStoresPromise();
  console.log(stores);
  const { data, error } = await fetchHousesPromise('01050000017880')
  console.log(stores)
  console.log(data)
}

main().catch((error) => {
  console.error("Error in main function:", error)
});

