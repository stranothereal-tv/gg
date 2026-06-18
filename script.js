import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL='https://twgtejzmidutigyhlwoq.supabase.co';
const SUPABASE_ANON_KEY='sb_publishable_Dj78Qtms2J3viGBN4KZbMA_uW5Nqqhh';
const supabase=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

const form=document.querySelector('#waitlist-form');
const releasedRadios=document.querySelectorAll('input[name="released"]');
const spotifySection=document.querySelector('#spotify-section');
const songSection=document.querySelector('#song-section');
const spotifyInput=document.querySelector('#spotify-profile');
const songInput=document.querySelector('#song-file');
const submitBtn=form.querySelector('button');

function toggle(){
 const yes=form.elements.released.value==='yes';
 spotifySection.classList.toggle('conditional-section--visible',yes);
 songSection.classList.toggle('conditional-section--visible',!yes && form.elements.released.value==='no');
 spotifyInput.required=yes;
 songInput.required=!yes;
}
releasedRadios.forEach(r=>r.addEventListener('change',toggle));toggle();

async function upload(file,email){
 const ext=file.name.split('.').pop();
 const path=`submissions/${email.replace(/[^a-z0-9]/gi,'_')}_${Date.now()}.${ext}`;
 const {error}=await supabase.storage.from('artist-song').upload(path,file);
 if(error) throw error;
 return supabase.storage.from('artist-song').getPublicUrl(path).data.publicUrl;
}

form.addEventListener('submit',async(e)=>{
 e.preventDefault();
 if(!form.reportValidity()) return;
 submitBtn.disabled=true;
 try{
   const fd=new FormData(form);
   const email=fd.get('email').trim().toLowerCase();
   let song_url=null;
   if(fd.get('released')==='no' && songInput.files.length){
      song_url=await upload(songInput.files[0],email);
   }
   const payload={
      full_name:fd.get('fullName').trim(),
      artist_name:fd.get('artistName').trim(),
      email,
      phone:fd.get('phone').trim(),
      social_accounts:fd.get('socials').trim(),
      youtube_channel:fd.get('youtube').trim(),
      released_music:fd.get('released')==='yes',
      spotify_url:fd.get('released')==='yes'?fd.get('spotifyArtistProfile').trim():null,
      song_url
   };
   const {error}=await supabase.from('artist_application').insert(payload);
   if(error) throw error;
   location.href='thanks.html';
 }catch(err){
   alert(err.message);
 }finally{
   submitBtn.disabled=false;
 }
});

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));}
