
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "ai_generations": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"input_tokens": number,"model": string,"output_tokens": number,"product_id": string | null,"title": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"input_tokens"?: number,"model": string,"output_tokens"?: number,"product_id"?: string | null,"title"?: string | null,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"input_tokens"?: number,"model"?: string,"output_tokens"?: number,"product_id"?: string | null,"title"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "ai_generations_product_id_user_id_fkey"
      columns: ["product_id","user_id"]
isOneToOne: false
      referencedRelation: "product_profit"
      referencedColumns: ["product_id","user_id"]
    },{
      foreignKeyName: "ai_generations_product_id_user_id_fkey"
      columns: ["product_id","user_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id","user_id"]
    }
                  ]
                },"expenses": {
                  Row: {
                    "amount": number,"category": Database["public"]['Enums']["expense_category"],"created_at": string,"description": string | null,"expense_date": string,"id": string,"product_id": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"category": Database["public"]['Enums']["expense_category"],"created_at"?: string,"description"?: string | null,"expense_date"?: string,"id"?: string,"product_id"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "amount"?: number,"category"?: Database["public"]['Enums']["expense_category"],"created_at"?: string,"description"?: string | null,"expense_date"?: string,"id"?: string,"product_id"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "expenses_product_id_user_id_fkey"
      columns: ["product_id","user_id"]
isOneToOne: false
      referencedRelation: "product_profit"
      referencedColumns: ["product_id","user_id"]
    },{
      foreignKeyName: "expenses_product_id_user_id_fkey"
      columns: ["product_id","user_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id","user_id"]
    }
                  ]
                },"products": {
                  Row: {
                    "brand": string | null,"category": string | null,"color": string | null,"condition": Database["public"]['Enums']["product_condition"] | null,"created_at": string,"id": string,"listed_price": number | null,"notes": string | null,"photo_paths": (string)[],"purchase_date": string | null,"purchase_price": number,"purchase_source": string | null,"size": string | null,"sku": string | null,"status": Database["public"]['Enums']["product_status"],"title": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "brand"?: string | null,"category"?: string | null,"color"?: string | null,"condition"?: Database["public"]['Enums']["product_condition"] | null,"created_at"?: string,"id"?: string,"listed_price"?: number | null,"notes"?: string | null,"photo_paths"?: (string)[],"purchase_date"?: string | null,"purchase_price"?: number,"purchase_source"?: string | null,"size"?: string | null,"sku"?: string | null,"status"?: Database["public"]['Enums']["product_status"],"title": string,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "brand"?: string | null,"category"?: string | null,"color"?: string | null,"condition"?: Database["public"]['Enums']["product_condition"] | null,"created_at"?: string,"id"?: string,"listed_price"?: number | null,"notes"?: string | null,"photo_paths"?: (string)[],"purchase_date"?: string | null,"purchase_price"?: number,"purchase_source"?: string | null,"size"?: string | null,"sku"?: string | null,"status"?: Database["public"]['Enums']["product_status"],"title"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "business_name": string | null,"created_at": string,"currency": string,"id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "business_name"?: string | null,"created_at"?: string,"currency"?: string,"id": string,"updated_at"?: string
                  }
                  Update: {
                    "business_name"?: string | null,"created_at"?: string,"currency"?: string,"id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"sales": {
                  Row: {
                    "created_at": string,"id": string,"notes": string | null,"platform": Database["public"]['Enums']["sales_platform"],"platform_fee": number,"product_id": string,"sale_date": string,"sale_price": number,"shipping_cost": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"notes"?: string | null,"platform": Database["public"]['Enums']["sales_platform"],"platform_fee"?: number,"product_id": string,"sale_date"?: string,"sale_price": number,"shipping_cost"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"notes"?: string | null,"platform"?: Database["public"]['Enums']["sales_platform"],"platform_fee"?: number,"product_id"?: string,"sale_date"?: string,"sale_price"?: number,"shipping_cost"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sales_product_id_user_id_fkey"
      columns: ["product_id","user_id"]
isOneToOne: false
      referencedRelation: "product_profit"
      referencedColumns: ["product_id","user_id"]
    },{
      foreignKeyName: "sales_product_id_user_id_fkey"
      columns: ["product_id","user_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id","user_id"]
    }
                  ]
                }
          }
          Views: {
            "product_profit": {
                  Row: {
                    "days_to_sell": number | null,"net_profit": number | null,"platform": Database["public"]['Enums']["sales_platform"] | null,"platform_fee": number | null,"product_expenses": number | null,"product_id": string,"purchase_date": string | null,"purchase_price": number,"sale_date": string | null,"sale_id": string | null,"sale_price": number | null,"shipping_cost": number | null,"status": Database["public"]['Enums']["product_status"],"title": string,"user_id": string
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            [_ in never]: never
          }
          Enums: {
            "expense_category": "shipping"|"packaging"|"transport"|"platform_fees"|"subscriptions"|"supplies"|"other","product_condition": "new_with_tags"|"new"|"very_good"|"good"|"fair","product_status": "in_stock"|"listed"|"reserved"|"sold"|"archived","sales_platform": "vinted"|"wallapop"|"ebay"|"milanuncios"|"todocoleccion"|"in_person"|"other"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "expense_category": ["shipping", "packaging", "transport", "platform_fees", "subscriptions", "supplies", "other"],"product_condition": ["new_with_tags", "new", "very_good", "good", "fair"],"product_status": ["in_stock", "listed", "reserved", "sold", "archived"],"sales_platform": ["vinted", "wallapop", "ebay", "milanuncios", "todocoleccion", "in_person", "other"]
          }
        }
} as const
