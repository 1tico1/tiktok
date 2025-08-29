// Mapeia categorias do painel -> categorias do YouTube
const YT_CAT = { humor: 23, esportes: 17, famosos: 24, entretenimento: 24 };

function parseISODuration(iso) {
  // PT#H#M#S -> segundos
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = +(m?.[1]||0), mm = +(m?.[2]||0), s = +(m?.[3]||0);
  return h*3600 + mm*60 + s;
}

module.exports = { YT_CAT, parseISODuration };