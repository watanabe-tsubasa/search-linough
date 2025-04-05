// types.ts
import type { Tables, TablesInsert, TablesUpdate } from '~/database.types'

export type House = Tables<'houses'>
export type NewHouse = TablesInsert<'houses'>
export type UpdateHouse = TablesUpdate<'houses'>

export type Store = Tables<'stores'>
export type NewStore = TablesInsert<'stores'>
export type UpdateStore = TablesUpdate<'stores'> 