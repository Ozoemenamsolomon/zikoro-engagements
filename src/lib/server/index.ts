import { createClient } from "@/utils/supabase/server"; 
import { PostgrestError } from "@supabase/supabase-js";
import { settings } from "../settings";

export const getUserData = async () =>{
  const supabase = createClient();

  const  {data:{user}, error} = await supabase.auth.getUser()
  const {data:userData, error:err} = await supabase.from('users').select('userEmail,id').eq('userEmail', user?.email).single()

  return {user:userData, error:error||err}
}

export const fetchAllData = async (table: string, orderBy?: string, start:number=1, end:number=settings.countLimit, selectOptions:string=`*`, ): Promise<{ data: any[]; error: PostgrestError | null; count:number | null }> => {
    const supabase = createClient();

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
  
  export const fetchOneRow = async (table: string, column:string, value:any, selectOptions:string='*' ): Promise<{ data: any; error: PostgrestError | null }> => {
    const supabase = createClient();
    const res= await supabase
        .from(table)
        .select(selectOptions)
        .eq(column, value)
        .single()
    return res;
  };
  
  export const filterByColumn = async (table: string, column:string, value:any, start:number=1, end:number=settings.countLimit, selectOptions:string='*' ): Promise<{ data: any; error: PostgrestError | null ,  count:number | null}> => {
    const supabase = createClient();
  
    const fetchTableSize = supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq(column,value);

    const fetchData= await supabase
        .from(table)
        .select(selectOptions)
        .eq(column,value)
        .range(start - 1, end - 1)
        .order('created_at', { ascending: false });

    const [dataResult, countResult] = await Promise.all([fetchData, fetchTableSize]);

    const { count } = countResult;
    const { data, error } = dataResult;
    return { data: data || [], error, count };
  };
  
  export const insertRow = async (table: string, data: any, selectOptions:string='*', log?:string): Promise<{ data: any; error: PostgrestError | null }> => {
    const supabase = createClient();
  
    const { data: insertedData, error } = await supabase
        .from(table)
        .insert(data)
        .select(selectOptions)
        .single();
 
    return { data: insertedData || null, error };
  };
  
  export const insertManyRows = async (table: string, list: any[]): Promise<{ data?: any; error: PostgrestError | null }> => {
    const supabase = createClient();
    const { data: insertedData, error } = await supabase
        .from(table)
        .insert(list)
        .select();
    
    return { data: insertedData, error };
  };
  
  export const updateRow = async (table: string, data: any, column: string, value: any, selectOptions:string=`*`, log?:string): Promise<{ data?: any; error: PostgrestError | null }> => {
    const supabase = createClient();
    const { data: updatedData, error } = await supabase 
        .from(table)
        .update(data)
        .eq(column, value)
        .select(selectOptions)
        .single();
        
    return { data: updatedData, error };
  };

  export const deleteRow = async (table: string,  column: string, value: any, log?:string): Promise<{ status: number; statusText: string; }> => {
    const supabase = createClient();
    console.log({table, column,value, log})
    
    const {status,statusText} = await supabase 
        .from(table)
        .delete()
        .eq(column, value)

    return {status,statusText};
  };

  export const deleteManyRows = async (table: string,  column: string, value: any[], log?:string): Promise<{ status: number; statusText: string; }> => {
    const supabase = createClient();

    const {status,statusText} = await supabase 
        .from(table)
        .delete()
        .in(column, value)  

    return {status,statusText};
  };

