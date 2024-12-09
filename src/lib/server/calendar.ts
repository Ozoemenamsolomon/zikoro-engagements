import { createClient } from "@/utils/supabase/server"
import { getUserData } from ".";
import { AppointmentUnavailability, Booking, FormattedUnavailability, UnavailabilityByDay } from "@/types/appointments";
import { subMonths, addMonths, isValid, startOfWeek, endOfWeek, format } from 'date-fns';

interface FetchBookingsResult {
  data:Booking[] | null, 
  error: string | null;
  count: number;
}

export const fetchCalendar = async (
 {view, userId}: {view?:string, userId?:string} 
): Promise<FetchBookingsResult> => {
    const supabase = createClient()

    let id;
    try {
      if(userId){
        id = userId
      } else {
        const {user} = await getUserData()
        id = user?.id
      }

      const { data, error, count } = await supabase
      .from('bookings')
      .select('*, appointmentLinkId(*, createdBy(userEmail, organization, firstName, lastName, phoneNumber))', { count: 'exact' })
      .eq("createdBy", id)
      // .order("appointmentDate", { ascending: true })

      // console.log('TESTING', { data,error,count});
    return {data, error:error?.message || null, count:0 };

  } catch (error) {
    console.error('Calendar Analytics error:', error);
    return {data:null, error: 'Error occured while fetching data',  count: 0 } 
  }
};

export function formatAppointmentsByMonth(data: Booking[]): Record<string, Booking[]> {
  // Group appointments by date for monthly view
  const formatted = data.reduce((acc, appointment) => {
    const date = new Date(appointment.appointmentDate as string).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, Booking[]>);
  // console.log({month:formatted})

  return formatted;
}

export function formatAppointmentsByWeek(data: Booking[]): Record<string, Record<number, Booking[]>> {
  //TODO: Group appointments by day and 5mins interval for weekly view
  const formatted = data.reduce((acc, appointment) => {
    const date = new Date(appointment.appointmentDate as string);
    const day = date.toDateString();
    const hour = new Date(`${day} ${appointment.appointmentTime}`).getHours();
    if (!acc[day]) acc[day] = {};
    if (!acc[day][hour]) acc[day][hour] = [];
    acc[day][hour].push(appointment);
    return acc;
  }, {} as Record<string, Record<number, Booking[]>>);
// console.log({week:formatted})
  return formatted;
}

// Function to format the unavailability data grouped by dayString with detailed formatting
export const formatUnavailability = (data: AppointmentUnavailability[]): UnavailabilityByDay => {
  return data.reduce<UnavailabilityByDay>((acc, item) => {
    if (!item.startDateTime || !item.endDateTime || !item.appointmentDate) return acc;
    
    const dayString = format(new Date(item.appointmentDate), 'eee MMM dd yyyy');
    
    const formattedUnavailability: FormattedUnavailability = {
      from: format(new Date(item.startDateTime), 'hh:mm a'),
      to: format(new Date(item.endDateTime), 'hh:mm a'),
      id: item.id!,
      appointmentDate: format(new Date(item.appointmentDate), 'eee MMM dd yyyy')
    };
    
    // Add to the respective dayString array
    if (!acc[dayString]) {
      acc[dayString] = [formattedUnavailability];
    } else {
      acc[dayString].push(formattedUnavailability);
    }

    return acc;
  }, {});
};


export async function fetchCalendarData(date: Date | string, viewingType: 'month' | 'week', userId?:string) {
  // Validate the viewing type and default to 'month' if invalid
  const viewing = viewingType === 'month' || viewingType === 'week' ? viewingType : 'week';

  // Parse and validate the provided date
  const parsedDate = new Date(date);
  const formattedDate = isValid(parsedDate) ? parsedDate : new Date();
  
  // Compute startRangeDate and endRangeDate
  const startRangeDate = subMonths(formattedDate, 2);
  const endRangeDate = addMonths(formattedDate, 2);
  
  const dateDisplay = (viewing === 'week') 
  ? `${format(startOfWeek(formattedDate), 'MMM d')} - ${format(endOfWeek(formattedDate), 'd, yyyy')}` 
  : format(formattedDate, 'MMMM yyyy');

  const supabase = createClient()

  let id;
    try {
      if(userId){
        id = userId
      } else {
        const {user} = await getUserData()
        id = user?.id
      }

  const { data, error } = await supabase
    .from('bookings') 
    .select('*, appointmentLinkId(*, createdBy(userEmail, organization, firstName, lastName, phoneNumber))', { count: 'exact' })
    .eq("createdBy", id)
    .gte('appointmentDate', startRangeDate.toISOString().split('T')[0])
    .lte('appointmentDate', endRangeDate.toISOString().split('T')[0]);
  
  const {count } = await supabase
    .from('bookings') 
    .select('*', { count: 'exact' } )
    .eq("createdBy", id)
  
  // Error handling
  if (error) {
    console.error(`Error fetching appointments from ${startRangeDate} to ${endRangeDate}:`, error);
    return {
      data: null,
      startRangeDate,
      endRangeDate,
      date: formattedDate,
      dataCount: 0,
      count,
      error:error?.message,
      dateDisplay,
      viewing,
    };
  }

  // fetch unavailble dates
  const { data:unavailableDatesData, error:err,  count:cc } = await supabase
    .from('appointmentUnavailability')
    .select('*',  { count: 'exact' })
    .eq("createdBy", id)
  
  // Format the data based on the viewing type
  const formattedMonthData = formatAppointmentsByMonth(data || {})
  const formattedWeekData = formatAppointmentsByWeek(data || {});
  const unavailableDates:UnavailabilityByDay = formatUnavailability(unavailableDatesData || []);

  // console.log({ formattedMonthData,formattedWeekData, startRangeDate, endRangeDate, date: formattedDate , count, dateDisplay, id});

  // Return the formatted data and range details
  return {
    formattedWeekData,formattedMonthData,
    startRangeDate,
    endRangeDate,
    date: formattedDate,
    count,
    error: null, 
    dateDisplay,
    unavailableDates, 
    viewing,
    dataCount:data?.length||0
  }
} catch (error){
    console.error(`Error fetching appointments from ${startRangeDate} to ${endRangeDate}:`, error);
    return {
      formattedWeekData:null,formattedMonthData:null,
      startRangeDate,
      endRangeDate,
      date: formattedDate,
      count:0,
      error: `Error fetching appointments from ${startRangeDate} to ${endRangeDate}`,
      dateDisplay,
      dataCount:0,
      unavailableDates:null,
    };
}
}


