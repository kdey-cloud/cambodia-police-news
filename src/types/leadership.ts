
export interface Leader {
  id: string;
  name_kh: string;
  name_en: string;
  position_kh: string | null;
  position_en: string | null;
  education_kh: string | null;
  education_en: string | null;
  address_kh: string | null;
  address_en: string | null;
  phone: string | null;
  email: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  id_number: string | null;
  created_at?: string;
  updated_at?: string;
}



