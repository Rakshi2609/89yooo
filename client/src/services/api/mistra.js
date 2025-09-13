const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function http(path, options={}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(token? { Authorization: 'Bearer '+token }: {}) },
    ...options
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export async function login(email, password){
  return http('/auth/login', { method:'POST', body: JSON.stringify({ email, password })});
}

export async function recommend(payload){
  return http('/mistra/recommend', { method:'POST', body: JSON.stringify(payload)});
}

export async function chat(message){
  return http('/mistra/chat', { method:'POST', body: JSON.stringify({ message })});
}

export async function getColleges(district){
  const q = district? `?district=${encodeURIComponent(district)}`:'';
  return http('/mistra/colleges'+q, { method:'GET' });
}

export async function getTimeline(){
  return http('/mistra/timeline', { method:'GET' });
}
