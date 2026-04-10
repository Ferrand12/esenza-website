export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "owner" | "staff";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "owner" | "staff";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: "owner" | "staff";
          created_at?: string;
        };
        Relationships: [];
      };
      guests: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string;
          country: string | null;
          notes: string | null;
          tags: string[];
          total_bookings: number;
          total_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone: string;
          country?: string | null;
          notes?: string | null;
          tags?: string[];
          total_bookings?: number;
          total_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string;
          country?: string | null;
          notes?: string | null;
          tags?: string[];
          total_bookings?: number;
          total_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          guest_id: string | null;
          check_in: string;
          check_out: string;
          num_guests: number;
          package: string;
          total_price: number;
          status: string;
          source: string;
          external_id: string | null;
          special_requests: string | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_id?: string | null;
          check_in: string;
          check_out: string;
          num_guests: number;
          package: string;
          total_price: number;
          status?: string;
          source?: string;
          external_id?: string | null;
          special_requests?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_id?: string | null;
          check_in?: string;
          check_out?: string;
          num_guests?: number;
          package?: string;
          total_price?: number;
          status?: string;
          source?: string;
          external_id?: string | null;
          special_requests?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey";
            columns: ["guest_id"];
            isOneToOne: false;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
        ];
      };
      calendar_blocks: {
        Row: {
          id: string;
          start_date: string;
          end_date: string;
          reason: string | null;
          source: string;
          external_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          start_date: string;
          end_date: string;
          reason?: string | null;
          source?: string;
          external_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          start_date?: string;
          end_date?: string;
          reason?: string | null;
          source?: string;
          external_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      communications: {
        Row: {
          id: string;
          guest_id: string;
          booking_id: string | null;
          channel: string;
          direction: string;
          content: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          guest_id: string;
          booking_id?: string | null;
          channel: string;
          direction: string;
          content: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          guest_id?: string;
          booking_id?: string | null;
          channel?: string;
          direction?: string;
          content?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "communications_guest_id_fkey";
            columns: ["guest_id"];
            isOneToOne: false;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
        ];
      };
      site_images: {
        Row: {
          id: string;
          section: string;
          slot: string;
          storage_path: string;
          alt_text: string | null;
          display_order: number;
          width: number | null;
          height: number | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section: string;
          slot: string;
          storage_path: string;
          alt_text?: string | null;
          display_order?: number;
          width?: number | null;
          height?: number | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section?: string;
          slot?: string;
          storage_path?: string;
          alt_text?: string | null;
          display_order?: number;
          width?: number | null;
          height?: number | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_config: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      sync_log: {
        Row: {
          id: string;
          source: string;
          status: string;
          events_imported: number;
          errors: Json | null;
          ran_at: string;
        };
        Insert: {
          id?: string;
          source: string;
          status: string;
          events_imported?: number;
          errors?: Json | null;
          ran_at?: string;
        };
        Update: {
          id?: string;
          source?: string;
          status?: string;
          events_imported?: number;
          errors?: Json | null;
          ran_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
