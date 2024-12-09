import { createClient } from "@/utils/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { settings } from "../settings";

const supabase = createClient()

// SIGNIN A USER
export const signin = async(email:string,password:string) => {
  return await supabase.auth
      .signInWithPassword({
        email,
        password,
      })
}

// fetch all data
export const fetchAllData = async (table: string, orderBy?: string, start:number=0, end:number=settings.countLimit, selectOptions:string=`*`, ): Promise<{ data: any[]; error: PostgrestError | null; count:number | null }> => {

  const fetchTableSize = supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

  const fetchData = supabase
      .from(table)
      .select(selectOptions)
      .range(start - 1, end - 1)
      .order(orderBy||'created_at', { ascending: false });
  
  const [dataResult, countResult] = await Promise.all([fetchData, fetchTableSize]);

  const { count } = countResult;
  const { data, error } = dataResult;

  return { data: data || [], error, count };
};