import type { House, Store } from "~/types"
import { supabase } from "./client"
import type { TablesInsert, TablesUpdate } from "~/database.types"

// ======================
// === Stores (Shops) === 
// ======================

/**
 * Fetches all stores from the database.
 * @returns {Promise<Store[]>} A promise that resolves to an array of stores.
 * @throws Will throw an error if the fetch operation fails.
 * @example
 * const stores = await fetchStores()
 * console.log(stores)
 * // Output: [{ id: 1, store: 'Store A' }, { id: 2, store: 'Store B' }]
 * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
 * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations.
 */
export const fetchStores = async (): Promise<Store[]> => {
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

/**
 * Inserts a new store into the database.
 * @param store - The store object to be inserted into the database.
 * @returns {Promise<Store[]>} A promise that resolves to the inserted store data.
 * @throws Will throw an error if the insert operation fails.
 * @example
 * const newStore = { store: 'New Store' }
 * const insertedStore = await insertStore(newStore)
 * console.log(insertedStore)
 * // Output: [{ id: 3, store: 'New Store' }]
 * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
 * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations.
 */
export const insertStore = async (store: TablesInsert<"stores">): Promise<Store[]> => {
  const { data, error } = await supabase
    .from("stores")
    .insert(store)
    .select() // 追加後のデータを返すために `.select()` をつけるのが推奨されます

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
  update: TablesUpdate<"stores">
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

/**
 * Inserts a new apartment into the database.
 * @param apartment - The apartment object to be inserted into the database.
 * @returns {Promise<House[]>} A promise that resolves to the inserted apartment data.
 * @throws Will throw an error if the insert operation fails.
 * @example
 * const newApartment = { address: '123 Main St', apartment: 'Apt 1', store_id: '01050000017880' }
 * const insertedApartment = await insertHouse(newApartment)
 * console.log(insertedApartment)
 * // Output: [{ id: 1, address: '123 Main St', apartment: 'Apt 1', store_id: '01050000017880' }]
 * @see {@link https://supabase.com/docs/guides/database} for more information on Supabase database operations.
 * @see {@link https://supabase.com/docs/guides/api} for more information on Supabase API operations.
 */
export const insertHouse = async (apartment: House): Promise<House[]> => {
  const { data, error } = await supabase
    .from("houses")
    .insert(apartment)

  if (error) {
    console.error("Error inserting apartment:", error)
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
export const updateHouse = async (id: number, updates: Partial<House>): Promise<House[]> => {
  const { data, error } = await supabase
    .from("houses")
    .update(updates)
    .eq("id", id)

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
