function metricsDaily(req, res) {
  const days = 7, today = new Date();
  const out = Array.from({length: days}).map((_,i)=>{
    const d = new Date(today); d.setDate(today.getDate() - (days-1-i));
    const iso = d.toISOString().slice(0,10);
    return {
      date: iso,
      views: 2000 + i*250,
      ret3s: +(0.24 + i*0.01).toFixed(2),
      followers: 100 + i*15
    };
  });
  res.json(out);
}

module.exports = { metricsDaily };