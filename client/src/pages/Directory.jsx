import React, { useEffect, useState } from 'react';
import { getColleges } from '../services/api/mistra.js';
import { motion } from 'framer-motion';

export default function Directory(){
  const [colleges, setColleges] = useState([]);
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setColleges(await getColleges(district)); } catch(e){ console.error(e); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); // eslint-disable-next-line
  },[]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1">Filter by District</label>
          <input value={district} onChange={e=>setDistrict(e.target.value)} placeholder="e.g. Pune" />
        </div>
        <button onClick={load} className="btn h-11">Apply</button>
      </div>
      {loading && <p>Loading...</p>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {colleges.map(c => (
          <motion.div key={c.id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="card space-y-2">
            <h3 className="h3 text-lg">{c.name}</h3>
            <p className="text-sm text-softText">District: {c.district}</p>
            <div className="text-xs flex flex-wrap gap-2">
              {c.courses.map(s => <span key={s} className="badge">{s}</span>)}
            </div>
            <p className="text-xs text-softText">Facilities: {c.facilities.join(', ')}</p>
            <p className="text-xs text-softText">Exams: {c.exams.join(', ')}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
