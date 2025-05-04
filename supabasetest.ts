import { fetchHouses, fetchStores, insertStore } from "~/lib/supabase/db"

const main = async () => {
  // const storeRes = await fetchStores();
  // console.log(storeRes);
  // const apartments = await fetchHouses('01050000017880')
  // console.log(apartments)
  const res = await insertStore([
    {
      store: 'test',
      store_id: 'test',
    },
    {
      store: 'test2',
      store_id: 'test2',
    },
  ]);
  console.log(res)
}

main().catch((error) => {
  console.error("Error in main function:", error)
});

