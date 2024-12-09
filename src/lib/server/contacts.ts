import { BookingsContact } from "@/types/appointments";
import { createClient } from "@/utils/supabase/server"
import { getUserData } from ".";

interface FetchContactsResult {
  data: BookingsContact[] | null;
  error: string | null;
  count: number;
}

export const fetchContacts = async (
  q?: string
): Promise<FetchContactsResult> => {
    const supabase = createClient()
    const {user} = await getUserData()
  try {
    let query = supabase
      .from('bookingsContact')
      .select('*', { count: 'exact' }) 
      .eq('createdBy', user?.id)
      .or('status.is.null,status.neq.ARCHIVED')
      .order('firstName', {ascending: false} ); 

    // If 'q' is provided, add additional filtering
    if (q) {
      query = query.eq('category', q); 
    }

    const { data, count, error } = await query;
    // console.error({user, data, count, error });

    if (error) {
      console.error('Error fetching contacts:', error);
      return { data: null, error: error.message, count: 0 };
    }

    return { data, error: null, count: count ?? 0 };
  } catch (error) {
    console.error('Server error:', error);
    return { data: null, error: 'Server error', count: 0 };
  }
};

export const fetchContact = async (
  contactId: string
): Promise<{data:BookingsContact|null, error: string | null;}> => {
    const supabase = createClient()
  try {
    const { data,  error } = await supabase
      .from('bookingsContact')
      .select('*') 
      .eq('id', contactId)
      .or('status.is.null,status.neq.ARCHIVED')
      .single()

    // console.error({ data, error });
    return { data, error: error?.message||null, };
  } catch (error) {
    console.error('Server error:', error);
    return { data: null, error: 'Server error', };
  }
};

