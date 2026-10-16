import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!anon||!key)return Response.json({error:'Konfigurasi server belum lengkap.'},{status:503});
  const store=await cookies();const session=createServerClient(url,anon,{cookies:{getAll:()=>store.getAll(),setAll:items=>items.forEach(({name,value,options})=>store.set(name,value,options))}});
  const {data:{user},error}=await session.auth.getUser();if(error||!user)return Response.json({error:'Sesi tidak valid.'},{status:401});
  if(user.app_metadata?.psa_role!=='partner')return Response.json({error:'Hanya akun mitra yang dapat memperbarui status sandi awal.'},{status:403});
  let input:Record<string,unknown>;try{input=await request.json()}catch{return Response.json({error:'Data perubahan sandi tidak valid.'},{status:400})}
  const oldPassword=typeof input.oldPassword==='string'?input.oldPassword:'';const newPassword=typeof input.newPassword==='string'?input.newPassword:'';
  if(!oldPassword||newPassword.length<8)return Response.json({error:'Masukkan sandi lama dan sandi baru minimal 8 karakter.'},{status:400});
  const verifier=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});const verified=await verifier.auth.signInWithPassword({email:user.email!,password:oldPassword});
  if(verified.error||verified.data.user?.id!==user.id)return Response.json({error:'Kata sandi lama tidak sesuai.'},{status:401});
  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const nextMetadata={...user.app_metadata};delete nextMetadata.must_change_password;
  const {data,error:updateError}=await admin.auth.admin.updateUserById(user.id,{password:newPassword,app_metadata:nextMetadata});
  if(updateError||!data.user)return Response.json({error:'Gagal menandai sandi awal telah diganti.'},{status:500});
  return Response.json({ok:true});
}
