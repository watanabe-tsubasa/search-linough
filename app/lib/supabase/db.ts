import type { House, NewHouse, NewStore, Store, UpdateHouse, UpdateStore } from "~/types"
import { supabase } from "./client"
// ======================
// === Stores (Shops) === 
// ======================

/**
 * Fetches all stores from the database.
 * @throws Will throw an error if the fetch operation fails.
 * @example
 * const stores = await fetchStores()
 * console.log(stores)
 * // Output: [{ id: 1, store: 'Store A' }, { id: 2, store: 'Store B' }]
 * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
 * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations.
 */
export const fetchStores = async () => {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("store", { ascending: true })

  if (error) {
    console.error("Error fetching stores:", error)
    return []
  }

  return data || []
}

// export const fetchStoresPromise = ():
//   Promise<{ stores: Store[]; error: any }> => {
//   return Promise.resolve(
//     supabase
//       .from("stores")
//       .select("*")
//       .order("store", { ascending: true })
//       .then(({ data, error }) => {
//         if (error) {
//           console.error("Error fetching stores:", error);
//           return { stores: [], error };
//         }
//         return { stores: data ?? [], error: null };
//       })
//   );
// };

/**
 * Fetches a single store by its store_id from the database.
 * @param storeId - The store_id of the store to fetch.
 * @returns {Promise<Store | null>} A promise that resolves to the store object or null if not found.
 * @throws Will throw an error if the fetch operation fails.
 * @example
 * const store = await fetchStoreById('tokyo-01')
 * console.log(store)
 * // Output: { id: 1, store: 'Tokyo', store_id: 'tokyo-01' }
 */
export const fetchStoreById = async (storeId: string): Promise<Store | null> => {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("store_id", storeId)
    .single() // 1件だけ返すように指定

  if (error) {
    console.error("Error fetching store by ID:", error)
    return null
  }

  return data
}

/**
 * Inserts a new store into the database.
 * @param store - The store object to be inserted into the database.
 * @returns {Promise<Store[]>} A promise that resolves to the inserted store data.
 * @throws Will throw an error if the insert operation fails.
 * @example
 * const newStore = { store: 'New Store', store_id: 'new-store-01' }
 * const insertedStore = await insertStore(newStore)
 * console.log(insertedStore)
 * // Output: [{ id: 1, store: 'New Store', store_id: 'new-store-01' }]
 * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
 * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations.
 */
export const insertStore = async (store: NewStore | NewStore[]): Promise<Store[]> => {
  const payload = Array.isArray(store) ? store : [store]
  const { data, error } = await supabase
    .from("stores")
    .insert(payload)
    .select()

  if (error) {
    console.error("Failed to insert store:", error)
    throw error
  }

  return data
}

/**
 * Updates an existing store in the database.
 * @param store_id - The ID of the store to be updated.
 * @param update - The update object containing the new store data.
 * @returns {Promise<Store[]>} A promise that resolves to the updated store data.
 * @throws Will throw an error if the update operation fails.
 * @example
 * const storeId = '12345'
 * const updateData = { store: 'Updated Store' }
 * const updatedStore = await updateStore(storeId, updateData)
 * console.log(updatedStore) 
 * // Output: [{ id: 12345, store: 'Updated Store' }]
 * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
 * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations. 
 */
export const updateStore = async (
  store_id: string,
  update: UpdateStore
): Promise<Store[]> => {
  const { data, error } = await supabase
    .from("stores")
    .update(update)
    .eq("store_id", store_id)
    .select()

  if (error) {
    console.error("Failed to update store:", error)
    throw error
  }

  return data
}

/**
 * Deletes a store from the database.
 * @param store_id - The ID of the store to be deleted.
 * @returns {Promise<void>} A promise that resolves when the store is deleted.
 * @throws Will throw an error if the delete operation fails.
 * @example
 * const storeId = '12345'
 * await deleteStore(storeId)
 * console.log('Store deleted successfully')
 * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
 * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations.
 */
export const deleteStore = async (store_id: string): Promise<void> => {
  const { error } = await supabase
    .from("stores")
    .delete()
    .eq("store_id", store_id)

  if (error) {
    // 紐づいているマンションがあって削除できない場合のエラーを処理
    console.error("Failed to delete store (possible relation exists):", error)
    throw error
  }
}

// ===========================
// === Houses (Apartments) ===
// ===========================

/**
 * Fetches all apartments for a given store from the database.
 * @param storeId - The ID of the store to fetch apartments for.
 * @returns {Promise<House[]>} A promise that resolves to an array of apartments.
 * @throws Will throw an error if the fetch operation fails.
 * @example
 * const storeId = '01050000017880'
 * const apartments = await fetchHouses(storeId)
 * console.log(apartments)
 * // Output: [{ id: 1, address: '123 Main St', apartment: 'Apt 1' }, { id: 2, address: '456 Elm St', apartment: 'Apt 2' }]
 * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
 * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations.
 */
export const fetchHouses = async (storeId: string): Promise<House[]> => {
  const { data, error } = await supabase
    .from("houses")
    .select("*")
    .eq("store_id", storeId)

  if (error) {
    console.error("Error fetching apartments:", error)
    return []
  }

  return data || []
}

// /**
//  * Fetches all apartments for a given store from the database.
//  * This function returns a promise that resolves to an array of apartments.
//  * @param storeId - The ID of the store to fetch apartments for.
//  * // Output: [{ id: 1, address: '123 Main St', apartment: 'Apt 1' }, { id: 2, address: '456 Elm St', apartment: 'Apt 2' }]
//  * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
//  * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations.
//  */
// export const fetchHousesPromise = (storeId: string): Promise<{ data: House[]; error: any }> => {
//   return Promise.resolve(
//     supabase
//       .from("houses")
//       .select("*")
//       .eq("store_id", storeId)
//       .then(({ data, error }) => {
//         if (error) {
//           console.error("Error fetching houses:", error);
//           return { data: [], error };
//         }
//         return { data: data ?? [], error: null };
//       })
//   );
// };

/**
 * Fetches a single house by its ID from the database.
 * @param id - The ID of the house to fetch.
 * @returns {Promise<House | null>} A promise that resolves to the house object or null if not found.
 * @throws Will throw an error if the fetch operation fails.
 * @example
 * const house = await fetchHouse(1)
 * console.log(house)
 * // Output: { id: 1, address: '123 Main St', apartment: 'Apt 1', ... }
 * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
 * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations.
 */
export const fetchHouse = async (id: number): Promise<House | null> => {
  const { data, error } = await supabase
    .from("houses")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching house by ID:", error)
    return null
  }

  return data
}

/**
 * Inserts one or multiple houses into the database.
 * Automatically detects whether the input is a single object or an array.
 *
 * @param input - A single NewHouse object or an array of NewHouse objects.
 * @returns A promise resolving to an array of inserted House records.
 *
 * @example
 * const result = await insertHouse({ ... })          // 単一件
 * const result = await insertHouse([{ ... }, { ... }]) // 複数件
 */
export const insertHouse = async (
  input: NewHouse | NewHouse[]
): Promise<House[]> => {
  const payload = Array.isArray(input) ? input : [input]

  const { data, error } = await supabase
    .from("houses")
    .insert(payload)
    .select()

  if (error) {
    console.error("Error inserting house(s):", error)
    return []
  }

  return data || []
}

/**
 * Updates an existing apartment in the database.
 * @param id - The ID of the apartment to be updated.
 * @param updates - The update object containing the new apartment data.
 * @returns {Promise<House[]>} A promise that resolves to the updated apartment data.
 * @throws Will throw an error if the update operation fails.
 * @example
 * const apartmentId = 1
 * const updateData = { address: '456 Elm St', apartment: 'Apt 2' }
 * const updatedApartment = await updateHouse(apartmentId, updateData)
 * console.log(updatedApartment)
 * // Output: [{ id: 1, address: '456 Elm St', apartment: 'Apt 2' }]
 * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
 * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations.
 */
export const updateHouse = async (id: number, updates: UpdateHouse): Promise<House[]> => {
  const { data, error } = await supabase
    .from("houses")
    .update(updates)
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating apartment:", error)
    return []
  }

  return data || []
}

/**
 * Deletes an apartment from the database.
 * @param id - The ID of the apartment to be deleted.
 * @returns {Promise<boolean>} A promise that resolves to true if the apartment was deleted successfully, false otherwise.
 * @throws Will throw an error if the delete operation fails.
 * @example
 * const apartmentId = 1
 * const result = await deleteHouse(apartmentId)
 * console.log(result) // Output: true if deleted successfully, false otherwise
 * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
 * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations.
 */
export const deleteHouse = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from("houses")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting apartment:", error)
    return false
  }

  return true
}

/**
 * Deletes multiple apartments from the database.
 * @param ids - The IDs of the apartments to be deleted.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion succeeded, false otherwise.
 */
export const deleteMultipleHouses = async (ids: number[]): Promise<boolean> => {
  const { error } = await supabase
    .from("houses")
    .delete()
    .in("id", ids)

  if (error) {
    console.error("Error deleting multiple apartments:", error)
    return false
  }

  return true
}
