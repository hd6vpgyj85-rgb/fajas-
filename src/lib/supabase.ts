import { createClient } from "@supabase/supabase-js";

// Valores por defecto del proyecto de Supabase de beautylat. La URL y la
// llave "anon" son seguras de publicar (se protegen con RLS, no ocultándolas)
// y de todas formas terminan incluidas en el JavaScript del sitio publicado
// sin importar si vienen de una variable de entorno o están aquí escritas.
// Si se conecta un proyecto de Supabase distinto en el futuro, basta con
// definir VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (.env.local o en
// Cloudflare) para sobreescribir estos valores.
const DEFAULT_SUPABASE_URL = "https://qddqrrkzkmoyfbnnvfek.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZHFycmt6a21veWZibm52ZmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NTgxMTQsImV4cCI6MjEwNjEzNDExNH0.vgkUcccsyexv0k0VVoLq-tdmJAKcDh6UMlHxbI5o31A";

const url = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey);
