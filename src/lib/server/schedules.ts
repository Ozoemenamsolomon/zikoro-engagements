import { AppointmentLink, } from "@/types/appointments";
import { createClient } from "@/utils/supabase/server"
import { getUserData } from ".";

interface FetchContactsResult {
  data: AppointmentLink[] | null;
  error: string | null;
  count: number;
}

export const fetchSchedules = async (
  userId?:string, start:number|string = 0, end:number|string = 19
): Promise<FetchContactsResult> => {
    const supabase = createClient()

    let id 
    if(userId){
      id = userId
    } else {
      const {user} = await getUserData()
      id = user?.id
    }

  try {
    let query = supabase
      .from('appointmentLinks')
      .select('*', { count: 'exact' }) 
      .eq('createdBy', id)
      .range(Number(start), Number(end))
      .order('created_at', {ascending: false} ); 

    // const {count } = await supabase
    //   .from('bookings') 
    //   .select('*', { count: 'exact' } )
    //   .eq('createdBy', id)

    const { data, count, error } = await query;
    // console.log({ data, count, error, id });

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

export const fetchSchedule = async (
  alias: string
) => {
    const supabase = createClient()

    try {
    const { data, error }  = await supabase
      .from('appointmentLinks')
      .select('*, createdBy(id, userEmail,organization,firstName,lastName,phoneNumber)') 
      .eq('id', alias)
      .single()

    console.error({ data, error });
    return { data, error: error?.message};
  } catch (error) {
    console.error('AppointmentLink Server error:', error);
    return { data: null, error: 'Server error'};
  }
};