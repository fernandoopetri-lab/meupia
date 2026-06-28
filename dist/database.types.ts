export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: number
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: number
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: number
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_logs_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: number
          name: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          status: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      crop_harvests: {
        Row: {
          created_at: string | null
          harvest_id: number
          id: number
          production_per_hectare: number
          production_unit: string
          silo_id: number | null
          total_production: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          harvest_id: number
          id?: number
          production_per_hectare: number
          production_unit: string
          silo_id?: number | null
          total_production: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          harvest_id?: number
          id?: number
          production_per_hectare?: number
          production_unit?: string
          silo_id?: number | null
          total_production?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_harvests_harvest_id_fkey"
            columns: ["harvest_id"]
            isOneToOne: false
            referencedRelation: "harvests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_harvests_silo_id_fkey"
            columns: ["silo_id"]
            isOneToOne: false
            referencedRelation: "silos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_harvests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      grain_sales: {
        Row: {
          buyer: string | null
          created_at: string | null
          destination_wallet_id: number | null
          discounts: number | null
          gross_value: number
          id: number
          net_value: number
          price_per_unit: number
          quantity_sold: number
          sale_date: string
          silo_id: number
          unit: string
          user_id: string
        }
        Insert: {
          buyer?: string | null
          created_at?: string | null
          destination_wallet_id?: number | null
          discounts?: number | null
          gross_value: number
          id?: number
          net_value: number
          price_per_unit: number
          quantity_sold: number
          sale_date: string
          silo_id: number
          unit: string
          user_id: string
        }
        Update: {
          buyer?: string | null
          created_at?: string | null
          destination_wallet_id?: number | null
          discounts?: number | null
          gross_value?: number
          id?: number
          net_value?: number
          price_per_unit?: number
          quantity_sold?: number
          sale_date?: string
          silo_id?: number
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grain_sales_destination_wallet_id_fkey"
            columns: ["destination_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grain_sales_silo_id_fkey"
            columns: ["silo_id"]
            isOneToOne: false
            referencedRelation: "silos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grain_sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      harvests: {
        Row: {
          created_at: string | null
          crop_name: string
          estimated_initial_cost: number | null
          final_harvest_date: string | null
          harvest_forecast_date: string | null
          id: number
          name: string | null
          planting_date: string
          plot_id: number
          seeds_used_quantity: number | null
          status: string
          total_yield: number | null
          user_id: string
          yield_unit: string | null
        }
        Insert: {
          created_at?: string | null
          crop_name: string
          estimated_initial_cost?: number | null
          final_harvest_date?: string | null
          harvest_forecast_date?: string | null
          id?: number
          name?: string | null
          planting_date: string
          plot_id: number
          seeds_used_quantity?: number | null
          status: string
          total_yield?: number | null
          user_id: string
          yield_unit?: string | null
        }
        Update: {
          created_at?: string | null
          crop_name?: string
          estimated_initial_cost?: number | null
          final_harvest_date?: string | null
          harvest_forecast_date?: string | null
          id?: number
          name?: string | null
          planting_date?: string
          plot_id?: number
          seeds_used_quantity?: number | null
          status?: string
          total_yield?: number | null
          user_id?: string
          yield_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "harvests_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      inputs: {
        Row: {
          application_date: string
          cost: number
          created_at: string | null
          harvest_id: number
          id: number
          input_type: string
          measurement_unit: string
          product_name: string
          quantity: number
          responsible: string | null
          user_id: string
        }
        Insert: {
          application_date: string
          cost: number
          created_at?: string | null
          harvest_id: number
          id?: number
          input_type: string
          measurement_unit: string
          product_name: string
          quantity: number
          responsible?: string | null
          user_id: string
        }
        Update: {
          application_date?: string
          cost?: number
          created_at?: string | null
          harvest_id?: number
          id?: number
          input_type?: string
          measurement_unit?: string
          product_name?: string
          quantity?: number
          responsible?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inputs_harvest_id_fkey"
            columns: ["harvest_id"]
            isOneToOne: false
            referencedRelation: "harvests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inputs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      investment_transactions: {
        Row: {
          amount: number
          created_at: string
          id: number
          investment_id: number
          related_wallet_id: number
          transaction_date: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at: string
          id?: number
          investment_id: number
          related_wallet_id: number
          transaction_date: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: number
          investment_id?: number
          related_wallet_id?: number
          transaction_date?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_transactions_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_transactions_related_wallet_id_fkey"
            columns: ["related_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      investments: {
        Row: {
          application_date: string
          created_at: string
          current_balance: number
          due_date: string | null
          id: number
          initial_amount: number
          institution: string
          investment_type: string
          origin_wallet_id: number
          status: string
          user_id: string
          yield_period: string
          yield_rate: number
        }
        Insert: {
          application_date: string
          created_at: string
          current_balance: number
          due_date?: string | null
          id?: number
          initial_amount: number
          institution: string
          investment_type: string
          origin_wallet_id: number
          status: string
          user_id: string
          yield_period: string
          yield_rate: number
        }
        Update: {
          application_date?: string
          created_at?: string
          current_balance?: number
          due_date?: string | null
          id?: number
          initial_amount?: number
          institution?: string
          investment_type?: string
          origin_wallet_id?: number
          status?: string
          user_id?: string
          yield_period?: string
          yield_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "investments_origin_wallet_id_fkey"
            columns: ["origin_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      livestock: {
        Row: {
          birth_date: string | null
          breed: string | null
          created_at: string | null
          ear_tag_id: string
          id: number
          milk_production_history: Json | null
          mother_id: number | null
          notes: string | null
          property_id: number | null
          sex: string | null
          status: string
          status_details: Json | null
          user_id: string
          weight_history: Json | null
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          ear_tag_id: string
          id?: number
          milk_production_history?: Json | null
          mother_id?: number | null
          notes?: string | null
          property_id?: number | null
          sex?: string | null
          status: string
          status_details?: Json | null
          user_id: string
          weight_history?: Json | null
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          ear_tag_id?: string
          id?: number
          milk_production_history?: Json | null
          mother_id?: number | null
          notes?: string | null
          property_id?: number | null
          sex?: string | null
          status?: string
          status_details?: Json | null
          user_id?: string
          weight_history?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "livestock_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "livestock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestock_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      livestock_events: {
        Row: {
          animal_id: number | null
          created_at: string | null
          details: Json | null
          event_date: string
          event_type: string
          id: number
          lot_id: number | null
          quantity: number | null
          shift: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          animal_id?: number | null
          created_at?: string | null
          details?: Json | null
          event_date: string
          event_type: string
          id?: number
          lot_id?: number | null
          quantity?: number | null
          shift?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          animal_id?: number | null
          created_at?: string | null
          details?: Json | null
          event_date?: string
          event_type?: string
          id?: number
          lot_id?: number | null
          quantity?: number | null
          shift?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "livestock_events_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "livestock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestock_events_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestock_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      livestock_lot_assignments: {
        Row: {
          assigned_at: string
          created_at: string | null
          id: number
          livestock_id: number
          lot_id: number
          unassigned_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at: string
          created_at?: string | null
          id?: number
          livestock_id: number
          lot_id: number
          unassigned_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          created_at?: string | null
          id?: number
          livestock_id?: number
          lot_id?: number
          unassigned_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestock_lot_assignments_livestock_id_fkey"
            columns: ["livestock_id"]
            isOneToOne: false
            referencedRelation: "livestock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestock_lot_assignments_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestock_lot_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      lots: {
        Row: {
          created_at: string | null
          id: number
          name: string
          notes: string | null
          property_id: number | null
          start_date: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          notes?: string | null
          property_id?: number | null
          start_date?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          notes?: string | null
          property_id?: number | null
          start_date?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lots_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      milk_sales: {
        Row: {
          buyer: string | null
          created_at: string
          destination_wallet_id: number | null
          id: number
          liters_sold: number
          payable_receivable_id: number | null
          payment_method: string
          price_per_liter: number
          sale_date: string
          total_value: number
          transaction_id: number | null
          user_id: string
        }
        Insert: {
          buyer?: string | null
          created_at: string
          destination_wallet_id?: number | null
          id?: number
          liters_sold: number
          payable_receivable_id?: number | null
          payment_method: string
          price_per_liter: number
          sale_date: string
          total_value: number
          transaction_id?: number | null
          user_id: string
        }
        Update: {
          buyer?: string | null
          created_at?: string
          destination_wallet_id?: number | null
          id?: number
          liters_sold?: number
          payable_receivable_id?: number | null
          payment_method?: string
          price_per_liter?: number
          sale_date?: string
          total_value?: number
          transaction_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milk_sales_destination_wallet_id_fkey"
            columns: ["destination_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milk_sales_payable_receivable_id_fkey"
            columns: ["payable_receivable_id"]
            isOneToOne: false
            referencedRelation: "payables_receivables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milk_sales_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milk_sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          is_read: boolean
          message: string
          related_url: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at: string
          id?: number
          is_read: boolean
          message: string
          related_url?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          is_read?: boolean
          message?: string
          related_url?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      payable_receivable_payments: {
        Row: {
          amount: number
          created_at: string
          id: number
          payment_date: string
          payable_receivable_id: number
          transaction_id: number | null
          user_id: string
          wallet_id: number
        }
        Insert: {
          amount: number
          created_at: string
          id?: number
          payment_date: string
          payable_receivable_id: number
          transaction_id?: number | null
          user_id: string
          wallet_id: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: number
          payment_date?: string
          payable_receivable_id?: number
          transaction_id?: number | null
          user_id?: string
          wallet_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "payable_receivable_payments_payable_receivable_id_fkey"
            columns: ["payable_receivable_id"]
            isOneToOne: false
            referencedRelation: "payables_receivables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payable_receivable_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payable_receivable_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payable_receivable_payments_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          }
        ]
      }
      payables_receivables: {
        Row: {
          amount: number
          category_id: number
          created_at: string
          description: string
          due_date: string
          id: number
          installment_group_id: string | null
          paid_amount: number
          paid_at: string | null
          related_transaction_id: number | null
          status: string
          type: string
          user_id: string
          wallet_id: number
        }
        Insert: {
          amount: number
          category_id: number
          created_at: string
          description: string
          due_date: string
          id?: number
          installment_group_id?: string | null
          paid_amount: number
          paid_at?: string | null
          related_transaction_id?: number | null
          status: string
          type: string
          user_id: string
          wallet_id: number
        }
        Update: {
          amount?: number
          category_id?: number
          created_at?: string
          description?: string
          due_date?: string
          id?: number
          installment_group_id?: string | null
          paid_amount?: number
          paid_at?: string | null
          related_transaction_id?: number | null
          status?: string
          type?: string
          user_id?: string
          wallet_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "payables_receivables_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payables_receivables_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payables_receivables_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payables_receivables_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          }
        ]
      }
      plots: {
        Row: {
          area: number
          created_at: string | null
          current_crop: string | null
          id: number
          location_description: string | null
          name: string
          property_id: number
          status: string
          user_id: string
        }
        Insert: {
          area: number
          created_at?: string | null
          current_crop?: string | null
          id?: number
          location_description?: string | null
          name: string
          property_id: number
          status: string
          user_id: string
        }
        Update: {
          area?: number
          created_at?: string | null
          current_crop?: string | null
          id?: number
          location_description?: string | null
          name?: string
          property_id?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plots_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          account_type: string | null
          id: string
          is_admin: boolean | null
          name: string | null
          phone: string | null
          plan_expires_at: string | null
          plan_status: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_type?: string | null
          id: string
          is_admin?: boolean | null
          name?: string | null
          phone?: string | null
          plan_expires_at?: string | null
          plan_status?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string | null
          phone?: string | null
          plan_expires_at?: string | null
          plan_status?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      properties: {
        Row: {
          created_at: string | null
          id: number
          location: string | null
          name: string
          size: number | null
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          location?: string | null
          name: string
          size?: number | null
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          location?: string | null
          name?: string
          size?: number | null
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      silo_stock: {
        Row: {
          created_at: string | null
          grain_type: string
          id: number
          quantity: number
          silo_id: number
          unit: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          grain_type: string
          id?: number
          quantity: number
          silo_id: number
          unit: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          grain_type?: string
          id?: number
          quantity?: number
          silo_id?: number
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "silo_stock_silo_id_fkey"
            columns: ["silo_id"]
            isOneToOne: false
            referencedRelation: "silos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "silo_stock_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      silos: {
        Row: {
          capacity: number | null
          capacity_unit: string | null
          cooperative: string | null
          created_at: string | null
          id: number
          location: string | null
          name: string
          user_id: string
        }
        Insert: {
          capacity?: number | null
          capacity_unit?: string | null
          cooperative?: string | null
          created_at?: string | null
          id?: number
          location?: string | null
          name: string
          user_id: string
        }
        Update: {
          capacity?: number | null
          capacity_unit?: string | null
          cooperative?: string | null
          created_at?: string | null
          id?: number
          location?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "silos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          billing_day: number
          category_id: number
          created_at: string
          id: number
          name: string
          status: string
          user_id: string
          wallet_id: number
        }
        Insert: {
          amount: number
          billing_day: number
          category_id: number
          created_at: string
          id?: number
          name: string
          status: string
          user_id: string
          wallet_id: number
        }
        Update: {
          amount?: number
          billing_day?: number
          category_id?: number
          created_at?: string
          id?: number
          name?: string
          status?: string
          user_id?: string
          wallet_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          }
        ]
      }
      transaction_logs: {
        Row: {
          changes: Json
          created_at: string | null
          id: number
          transaction_id: number
          user_id: string
        }
        Insert: {
          changes: Json
          created_at?: string | null
          id?: number
          transaction_id: number
          user_id: string
        }
        Update: {
          changes?: Json
          created_at?: string | null
          id?: number
          transaction_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string | null
          category_id: number | null
          created_at: string | null
          date: string
          description: string
          destination_wallet_id: number | null
          id: number
          installment_number: number | null
          installment_of: number | null
          invoice_date: string | null
          source_wallet_id: number | null
          total_installments: number | null
          type: string
          user_id: string
          wallet_id: number | null
        }
        Insert: {
          amount: number
          category?: string | null
          category_id?: number | null
          created_at?: string | null
          date: string
          description: string
          destination_wallet_id?: number | null
          id?: number
          installment_number?: number | null
          installment_of?: number | null
          invoice_date?: string | null
          source_wallet_id?: number | null
          total_installments?: number | null
          type: string
          user_id: string
          wallet_id?: number | null
        }
        Update: {
          amount?: number
          category?: string | null
          category_id?: number | null
          created_at?: string | null
          date?: string
          description?: string
          destination_wallet_id?: number | null
          id?: number
          installment_number?: number | null
          installment_of?: number | null
          invoice_date?: string | null
          source_wallet_id?: number | null
          total_installments?: number | null
          type?: string
          user_id?: string
          wallet_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_destination_wallet_id_fkey"
            columns: ["destination_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_installment_of_fkey"
            columns: ["installment_of"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_source_wallet_id_fkey"
            columns: ["source_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          }
        ]
      }
      wallets: {
        Row: {
          balance: number
          closing_day: number | null
          color: string | null
          created_at: string | null
          due_day: number | null
          id: number
          name: string
          type: string
          user_id: string
        }
        Insert: {
          balance: number
          closing_day?: number | null
          color?: string | null
          created_at?: string | null
          due_day?: number | null
          id?: number
          name: string
          type: string
          user_id: string
        }
        Update: {
          balance?: number
          closing_day?: number | null
          color?: string | null
          created_at?: string | null
          due_day?: number | null
          id?: number
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_due_date_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_balance_on_date: {
        Args: {
          p_wallet_id: number
          p_date: string
        }
        Returns: number
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      process_grain_sale: {
        Args: {
          p_user_id: string
          p_silo_id: number
          p_grain_type: string
          p_sale_date: string
          p_quantity_sold: number
          p_unit: string
          p_price_per_unit: number
          p_buyer: string
          p_discounts: number
          p_gross_value: number
          p_net_value: number
          p_destination_wallet_id: number
          p_stock_id: number
        }
        Returns: undefined
      }
      set_credit_card_invoice_date: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}