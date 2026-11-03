import { RESPONSES } from "@/shared/constant/api.responses";
import { getNextAuthToken } from "@/shared/lib/utils/auth.util";

export async function getAppointmentStats(){
  
    const token = await getNextAuthToken()
    if (!token?.accessToken) {
        return RESPONSES.unauthorized
    }
}