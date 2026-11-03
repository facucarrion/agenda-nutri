// Shapes of the public booking API (see docs/api.md, section 6).

export type PublicAppointmentType = {
  id: string;
  name: string;
  duration_minutes: number;
};

export type PublicProfile = {
  fullName: string;
  slug: string;
  timezone: string;
  types: PublicAppointmentType[];
};

export type BookingRequest = {
  type: string;
  starts_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  consent: true;
  website: string;
};
