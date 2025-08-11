
 type Gender = "male" | "female";
 type Status = "active" | "blocked" | "inactive";
 type Medium =
  | "friend"
  | "referral"
  | "facebook"
  | "instagram"
  | "google"
  | "twitter"
  | "linkedin"
  | "others";
 type Platform = "web" | "mobile";

export interface ECustomer  {
  id: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  account_ref: string | null;
  full_name: string | null;
  gabs_tag: string | null;
  email: string | null;
  has_onboarded: boolean;
  password: string | null;
  phone_number: string | null;
  bvn_phone_number: string | null;
  country: string;
  status: Status;
  referral_code: string | null;
  referral_link: string | null;
  referred_by: string | null;
  referrals: string[];
  gender: Gender;
  providers: any; 
  bvn: string | null;
  kyc_level: number;
  nin: string | null;
  avatar: string | null;
  medium: Medium | null;
  date_of_birth: string | null;
  state_of_origin: string | null;
  is_flagged: boolean | null;
  platform: Platform | null;
  terms: boolean;
  address: any; 
  passcode: string | null;
  secure_pin: string | null;
  refresh_token: string[];
  created_at: Date;
}