import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Recommendations(){
  const { state } = useLocation();
  const recs = state?.recs;
  if (!recs) return <p>No recommendations yet. Take the quiz.</p>;
  return (
    <div className="space-y-8">
      <h2 className="h2">Your Personalized Recommendations</h2>
      <div className="space-y-4">
        <h3 className="h3 text-xl">Streams</h3>
        <div className="flex flex-wrap gap-3">{recs.recommended_streams?.map(s => <span key={s} className="badge">{s}</span>)}</div>
      </div>
      <div className="space-y-4">
        <h3 className="h3 text-xl">Degrees</h3>
        <div className="grid md:grid-cols-2 gap-5">
          {recs.recommended_degrees?.map(d => (
            <motion.div key={d.name} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="card">
              <h4 className="font-bold text-lg mb-1">{d.name}</h4>
              <p className="text-sm text-softText mb-2">{d.description}</p>
              <p className="text-xs mb-1"><span className="font-semibold">Salary:</span> {d.average_salary_range}</p>
              <p className="text-xs mb-2"><span className="font-semibold">Growth:</span> {d.growth_outlook}</p>
              <div className="text-xs mb-2"><span className="font-semibold">Roles:</span> {d.key_job_roles?.join(', ')}</div>
              <div className="text-xs"><span className="font-semibold">Gov Exams:</span> {d.government_exams?.join(', ')}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="h3 text-xl">Suggested Colleges</h3>
        <div className="flex flex-wrap gap-3">{recs.suggested_colleges?.map(c => <span key={c} className="badge">{c}</span>)}</div>
      </div>
      <div className="space-y-4">
        <h3 className="h3 text-xl">Next Steps</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          {recs.next_steps?.map((n,i)=>(<li key={i}>{n}</li>))}
        </ol>
      </div>
    </div>
  );
}
