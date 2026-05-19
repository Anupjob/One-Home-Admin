import { create } from "zustand";
import { userDetails } from "../Services/authenticationService";
import { selectedPartnerDetails } from "../Services/authenticationService";

export const useUserDetailsStore = create((set) => ({
    // selectedPartnerValue: userDetails()?.partnerDetails[0]?._id || '',
    selectedPartnerValue: selectedPartnerDetails()?._id || userDetails()?.partnerDetails[0]?._id || '',
    setSelectedPartnerValue: (value) => set({ selectedPartnerValue: value }),
    
   
}));
