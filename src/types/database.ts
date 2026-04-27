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
      complaints: {
        Row: {
          id: string;
          tracking_code: string;
          type: "peticion" | "queja" | "reclamo" | "sugerencia" | "felicitacion";
          subject: string;
          description: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string | null;
          booking_id: string | null;
          status: "nuevo" | "en_proceso" | "resuelto" | "cerrado";
          priority: "baja" | "media" | "alta" | "urgente";
          assigned_to: string | null;
          channel: "web" | "email" | "whatsapp" | "presencial";
          sla_due_at: string;
          resolved_at: string | null;
          resolution_notes: string | null;
          internal_notes: string | null;
          attachments: Json;
          ai_classification: Json | null;
          ai_sentiment: "positive" | "neutral" | "negative" | "urgent" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tracking_code: string;
          type: "peticion" | "queja" | "reclamo" | "sugerencia" | "felicitacion";
          subject: string;
          description: string;
          guest_name: string;
          guest_email: string;
          guest_phone?: string | null;
          booking_id?: string | null;
          status?: "nuevo" | "en_proceso" | "resuelto" | "cerrado";
          priority?: "baja" | "media" | "alta" | "urgente";
          assigned_to?: string | null;
          channel?: "web" | "email" | "whatsapp" | "presencial";
          sla_due_at: string;
          resolved_at?: string | null;
          resolution_notes?: string | null;
          internal_notes?: string | null;
          attachments?: Json;
          ai_classification?: Json | null;
          ai_sentiment?: "positive" | "neutral" | "negative" | "urgent" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          tracking_code: string;
          type: "peticion" | "queja" | "reclamo" | "sugerencia" | "felicitacion";
          subject: string;
          description: string;
          guest_name: string;
          guest_email: string;
          guest_phone: string | null;
          booking_id: string | null;
          status: "nuevo" | "en_proceso" | "resuelto" | "cerrado";
          priority: "baja" | "media" | "alta" | "urgente";
          assigned_to: string | null;
          channel: "web" | "email" | "whatsapp" | "presencial";
          sla_due_at: string;
          resolved_at: string | null;
          resolution_notes: string | null;
          internal_notes: string | null;
          attachments: Json;
          ai_classification: Json | null;
          ai_sentiment: "positive" | "neutral" | "negative" | "urgent" | null;
        }>;
        Relationships: [];
      };
      complaint_events: {
        Row: {
          id: string;
          complaint_id: string;
          event_type: string;
          from_value: string | null;
          to_value: string | null;
          note: string | null;
          actor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          complaint_id: string;
          event_type: string;
          from_value?: string | null;
          to_value?: string | null;
          note?: string | null;
          actor_id?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          event_type: string;
          from_value: string | null;
          to_value: string | null;
          note: string | null;
        }>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          guest_id: string | null;
          booking_id: string | null;
          source: "internal" | "google" | "airbnb" | "tripadvisor" | "booking_com";
          rating: number;
          title: string | null;
          content: string;
          language: "es" | "en";
          response: string | null;
          response_at: string | null;
          response_by: string | null;
          status: "pending" | "approved" | "rejected" | "featured";
          token: string | null;
          token_expires_at: string | null;
          external_id: string | null;
          external_url: string | null;
          display_name: string;
          sub_ratings: Json | null;
          photos: Json;
          ai_sentiment: "positive" | "neutral" | "negative" | null;
          ai_tags: Json | null;
          submitted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_id?: string | null;
          booking_id?: string | null;
          source?: "internal" | "google" | "airbnb" | "tripadvisor" | "booking_com";
          rating: number;
          title?: string | null;
          content: string;
          language?: "es" | "en";
          response?: string | null;
          response_at?: string | null;
          response_by?: string | null;
          status?: "pending" | "approved" | "rejected" | "featured";
          token?: string | null;
          token_expires_at?: string | null;
          external_id?: string | null;
          external_url?: string | null;
          display_name: string;
          sub_ratings?: Json | null;
          photos?: Json;
          ai_sentiment?: "positive" | "neutral" | "negative" | null;
          ai_tags?: Json | null;
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          guest_id: string | null;
          booking_id: string | null;
          source: "internal" | "google" | "airbnb" | "tripadvisor" | "booking_com";
          rating: number;
          title: string | null;
          content: string;
          language: "es" | "en";
          response: string | null;
          response_at: string | null;
          response_by: string | null;
          status: "pending" | "approved" | "rejected" | "featured";
          token: string | null;
          token_expires_at: string | null;
          external_id: string | null;
          external_url: string | null;
          display_name: string;
          sub_ratings: Json | null;
          photos: Json;
          ai_sentiment: "positive" | "neutral" | "negative" | null;
          ai_tags: Json | null;
        }>;
        Relationships: [];
      };
      retreat_registrations: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          country: string;
          motivation: string | null;
          traveling_from_out_of_town: boolean;
          arrival_details: string | null;
          dietary_restrictions: string | null;
          injuries_notes: string | null;
          ground_transport: "yes" | "no" | "unknown";
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          additional_notes: string | null;
          waiver_accepted: boolean;
          signature: string | null;
          language: "es" | "en";
          retreat_type: string | null;
          status: "nuevo" | "confirmada" | "cancelada";
          guest_id: string | null;
          booking_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone: string;
          country: string;
          motivation?: string | null;
          traveling_from_out_of_town?: boolean;
          arrival_details?: string | null;
          dietary_restrictions?: string | null;
          injuries_notes?: string | null;
          ground_transport?: "yes" | "no" | "unknown";
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          additional_notes?: string | null;
          waiver_accepted?: boolean;
          signature?: string | null;
          language?: "es" | "en";
          retreat_type?: string | null;
          status?: "nuevo" | "confirmada" | "cancelada";
          guest_id?: string | null;
          booking_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          full_name: string;
          email: string;
          phone: string;
          country: string;
          motivation: string | null;
          traveling_from_out_of_town: boolean;
          arrival_details: string | null;
          dietary_restrictions: string | null;
          injuries_notes: string | null;
          ground_transport: "yes" | "no" | "unknown";
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          additional_notes: string | null;
          waiver_accepted: boolean;
          signature: string | null;
          language: "es" | "en";
          retreat_type: string | null;
          status: "nuevo" | "confirmada" | "cancelada";
          guest_id: string | null;
          booking_id: string | null;
        }>;
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
