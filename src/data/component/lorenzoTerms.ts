// 羅倫佐名詞長按看圖：名詞編號 → 圖片檔與出處。bggName：'Lorenzo il Magnifico: Big Box'。
// 暫時沒有被任何元件引用；等「名詞長按」功能（`生成後.md` 3.1 ⑦，階段④）做好後再接上。
//
// 名詞編號 id 與 lorenzoCards.ts 的 id 相同（領袖 leader-*、家族 family-*、逐出教會 ex*），之後換成 `game_terms` 的名詞編號時只要照這張表轉。
// 圖片來源：Reference_sheet_Lorenzo_il_Magnifico_NL_Versie01.pdf（荷蘭文參考手冊，BGG 使用者 happygamer031276 自製，2025 年第 1 版）；
//   用 200 dpi 把第 15～23 頁轉成圖，每張卡、每塊板塊各裁一張小圖（webp）。卡面插圖是 Cranio Creations 的版權圖。
// 〔使用者決定，2026-11-27〕圖片不公開：只給 VIP／管理者看，放私有 Storage、用簽名網址；先不去 BGG 留言問作者。
//   所以這些圖片不要放 public\ 資料夾，也不要 git add；放進私有 bucket 的位置與檔名規則由名詞長按那條主線決定，下面 file 欄位只是暫定（相對路徑）。
// 沒有圖的：Beato Angelico、Vitellozzo Vitelli（手冊沒有這兩張）；逐出教會的 ex1-leader-cost、ex2-remove-leader、ex3-leader（手冊沒有）；發展卡 168 張本批沒裁。
// 圖片都是荷蘭文版卡面（效果文字不在圖上，只有圖示與數字），所以中文使用者看得懂；中文效果與需求看 lorenzoCards.ts。

export type LorenzoTermImage = {
  file: string // 暫定相對路徑，例：lorenzo/leader-bramante.webp
  nlPage: number // 荷蘭文參考手冊的頁碼（PDF 頁數）
  nlName: string // 手冊上的名稱（荷蘭文版沿用英文名；Salviati、Batitsta 等拼法照手冊）
}

export const LORENZO_TERM_IMAGES: Record<string, LorenzoTermImage> = {
  'ex1-coin': { file: 'lorenzo/ex1-coin.webp', nlPage: 20, nlName: 'ex1-coin' },
  'ex1-colored': { file: 'lorenzo/ex1-colored.webp', nlPage: 21, nlName: 'ex1-colored' },
  'ex1-harvest': { file: 'lorenzo/ex1-harvest.webp', nlPage: 20, nlName: 'ex1-harvest' },
  'ex1-military': { file: 'lorenzo/ex1-military.webp', nlPage: 20, nlName: 'ex1-military' },
  'ex1-production': { file: 'lorenzo/ex1-production.webp', nlPage: 21, nlName: 'ex1-production' },
  'ex1-servant': { file: 'lorenzo/ex1-servant.webp', nlPage: 20, nlName: 'ex1-servant' },
  'ex1-token': { file: 'lorenzo/ex1-token.webp', nlPage: 21, nlName: 'ex1-token' },
  'ex1-wood-stone': { file: 'lorenzo/ex1-wood-stone.webp', nlPage: 20, nlName: 'ex1-wood-stone' },
  'ex2-building': { file: 'lorenzo/ex2-building.webp', nlPage: 20, nlName: 'ex2-building' },
  'ex2-character': { file: 'lorenzo/ex2-character.webp', nlPage: 20, nlName: 'ex2-character' },
  'ex2-market': { file: 'lorenzo/ex2-market.webp', nlPage: 20, nlName: 'ex2-market' },
  'ex2-no-special-tower': { file: 'lorenzo/ex2-no-special-tower.webp', nlPage: 21, nlName: 'ex2-no-special-tower' },
  'ex2-servants': { file: 'lorenzo/ex2-servants.webp', nlPage: 21, nlName: 'ex2-servants' },
  'ex2-skip-turn': { file: 'lorenzo/ex2-skip-turn.webp', nlPage: 21, nlName: 'ex2-skip-turn' },
  'ex2-territory': { file: 'lorenzo/ex2-territory.webp', nlPage: 20, nlName: 'ex2-territory' },
  'ex2-venture': { file: 'lorenzo/ex2-venture.webp', nlPage: 20, nlName: 'ex2-venture' },
  'ex3-building-cost': { file: 'lorenzo/ex3-building-cost.webp', nlPage: 21, nlName: 'ex3-building-cost' },
  'ex3-military': { file: 'lorenzo/ex3-military.webp', nlPage: 20, nlName: 'ex3-military' },
  'ex3-no-character': { file: 'lorenzo/ex3-no-character.webp', nlPage: 20, nlName: 'ex3-no-character' },
  'ex3-no-territory': { file: 'lorenzo/ex3-no-territory.webp', nlPage: 20, nlName: 'ex3-no-territory' },
  'ex3-no-venture': { file: 'lorenzo/ex3-no-venture.webp', nlPage: 20, nlName: 'ex3-no-venture' },
  'ex3-over-four': { file: 'lorenzo/ex3-over-four.webp', nlPage: 21, nlName: 'ex3-over-four' },
  'ex3-resources': { file: 'lorenzo/ex3-resources.webp', nlPage: 21, nlName: 'ex3-resources' },
  'ex3-vp-fifth': { file: 'lorenzo/ex3-vp-fifth.webp', nlPage: 20, nlName: 'ex3-vp-fifth' },
  'family-aragonesi': { file: 'lorenzo/family-aragonesi.webp', nlPage: 23, nlName: 'Argonesi' },
  'family-colonna': { file: 'lorenzo/family-colonna.webp', nlPage: 22, nlName: 'Colonna' },
  'family-da-montefeltro': { file: 'lorenzo/family-da-montefeltro.webp', nlPage: 22, nlName: 'Da Montefeltro' },
  'family-della-rovere': { file: 'lorenzo/family-della-rovere.webp', nlPage: 22, nlName: 'Della Rovere' },
  'family-della-scala': { file: 'lorenzo/family-della-scala.webp', nlPage: 23, nlName: 'Della Scala' },
  'family-este': { file: 'lorenzo/family-este.webp', nlPage: 22, nlName: 'Este' },
  'family-gonzaga': { file: 'lorenzo/family-gonzaga.webp', nlPage: 23, nlName: 'Gonzaga' },
  'family-malatesta': { file: 'lorenzo/family-malatesta.webp', nlPage: 22, nlName: 'Malatesta' },
  'family-medici': { file: 'lorenzo/family-medici.webp', nlPage: 22, nlName: 'Medici' },
  'family-orsini': { file: 'lorenzo/family-orsini.webp', nlPage: 23, nlName: 'Orsini' },
  'family-sforza': { file: 'lorenzo/family-sforza.webp', nlPage: 23, nlName: 'Sforza' },
  'family-visconti': { file: 'lorenzo/family-visconti.webp', nlPage: 23, nlName: 'Visconti' },
  'leader-alfonso-i-deste': { file: 'lorenzo/leader-alfonso-i-deste.webp', nlPage: 15, nlName: 'Alfonso I d’Este' },
  'leader-alfonso-v-daragona': { file: 'lorenzo/leader-alfonso-v-daragona.webp', nlPage: 15, nlName: 'Alfonso V d’Aragona' },
  'leader-bartolomeo-colleoni': { file: 'lorenzo/leader-bartolomeo-colleoni.webp', nlPage: 15, nlName: 'Bartolomeo Colleoni' },
  'leader-beatrice-deste': { file: 'lorenzo/leader-beatrice-deste.webp', nlPage: 15, nlName: 'Beatrice d’Este' },
  'leader-bramante': { file: 'lorenzo/leader-bramante.webp', nlPage: 16, nlName: 'Bramante' },
  'leader-carlo-viii': { file: 'lorenzo/leader-carlo-viii.webp', nlPage: 16, nlName: 'Carlo VIII' },
  'leader-cesare-borgia': { file: 'lorenzo/leader-cesare-borgia.webp', nlPage: 16, nlName: 'Cesare Borgia' },
  'leader-cosimo-de-medici': { file: 'lorenzo/leader-cosimo-de-medici.webp', nlPage: 16, nlName: 'Cosimo de’ Medici' },
  'leader-erasmo-da-rotterdam': { file: 'lorenzo/leader-erasmo-da-rotterdam.webp', nlPage: 16, nlName: 'Erasmo da Rotterdam' },
  'leader-ercole-i-deste': { file: 'lorenzo/leader-ercole-i-deste.webp', nlPage: 16, nlName: 'Ercole I d’Este' },
  'leader-federico-da-montefeltro': { file: 'lorenzo/leader-federico-da-montefeltro.webp', nlPage: 16, nlName: 'Federico da Montefeltro' },
  'leader-ferdinando-daragona': { file: 'lorenzo/leader-ferdinando-daragona.webp', nlPage: 16, nlName: 'Ferdinando d’Aragona' },
  'leader-filippo-brunelleschi': { file: 'lorenzo/leader-filippo-brunelleschi.webp', nlPage: 16, nlName: 'Filippo Brunelleschi' },
  'leader-francesco-sforza': { file: 'lorenzo/leader-francesco-sforza.webp', nlPage: 16, nlName: 'Francesco Sforza' },
  'leader-giovanni-dalle-bande-nere': { file: 'lorenzo/leader-giovanni-dalle-bande-nere.webp', nlPage: 17, nlName: 'Giovanni dalle Bande Nere' },
  'leader-girolamo-savonarola': { file: 'lorenzo/leader-girolamo-savonarola.webp', nlPage: 17, nlName: 'Girolamo Savonarola' },
  'leader-giulio-ii': { file: 'lorenzo/leader-giulio-ii.webp', nlPage: 17, nlName: 'Giulio II' },
  'leader-guglielmo-de-pazzi': { file: 'lorenzo/leader-guglielmo-de-pazzi.webp', nlPage: 17, nlName: 'Guglielmo de’ Pazzi' },
  'leader-jacopo-salviati': { file: 'lorenzo/leader-jacopo-salviati.webp', nlPage: 17, nlName: 'Jacopo Salviati' },
  'leader-ladislao-vii-jagellone': { file: 'lorenzo/leader-ladislao-vii-jagellone.webp', nlPage: 17, nlName: 'Ladislao VII Jagellone' },
  'leader-leon-battista-alberti': { file: 'lorenzo/leader-leon-battista-alberti.webp', nlPage: 17, nlName: 'Leon Batitsta Alberti' },
  'leader-leonardo-da-vinci': { file: 'lorenzo/leader-leonardo-da-vinci.webp', nlPage: 17, nlName: 'Leonardo da Vinci' },
  'leader-lorenzo-de-medici': { file: 'lorenzo/leader-lorenzo-de-medici.webp', nlPage: 17, nlName: 'Lorenzo de’ Medici' },
  'leader-lucia-da-narni': { file: 'lorenzo/leader-lucia-da-narni.webp', nlPage: 17, nlName: 'Lucia da Narni' },
  'leader-lucrezia-borgia': { file: 'lorenzo/leader-lucrezia-borgia.webp', nlPage: 18, nlName: 'Lucrezia Borgia' },
  'leader-ludovico-ariosto': { file: 'lorenzo/leader-ludovico-ariosto.webp', nlPage: 18, nlName: 'Ludovico Ariosto' },
  'leader-ludovico-iii-gonzaga': { file: 'lorenzo/leader-ludovico-iii-gonzaga.webp', nlPage: 18, nlName: 'Ludovico III Gonzaga' },
  'leader-ludovico-il-moro': { file: 'lorenzo/leader-ludovico-il-moro.webp', nlPage: 18, nlName: 'Ludovico il Moro' },
  'leader-marsilio-ficino': { file: 'lorenzo/leader-marsilio-ficino.webp', nlPage: 18, nlName: 'Marsilio Ficino' },
  'leader-martin-lutero': { file: 'lorenzo/leader-martin-lutero.webp', nlPage: 18, nlName: 'Martin Lutero' },
  'leader-massimiliano-i-dasburgo': { file: 'lorenzo/leader-massimiliano-i-dasburgo.webp', nlPage: 18, nlName: 'Massimiliano I d’Asburgo' },
  'leader-michelangelo-buonarroti': { file: 'lorenzo/leader-michelangelo-buonarroti.webp', nlPage: 18, nlName: 'Michelangelo Buonarroti' },
  'leader-niccolo-machiavelli': { file: 'lorenzo/leader-niccolo-machiavelli.webp', nlPage: 18, nlName: 'Niccolo Machiavelli' },
  'leader-palla-strozzi': { file: 'lorenzo/leader-palla-strozzi.webp', nlPage: 18, nlName: 'Palla Strozzi' },
  'leader-paracelso': { file: 'lorenzo/leader-paracelso.webp', nlPage: 19, nlName: 'Paracelso' },
  'leader-pico-della-mirandola': { file: 'lorenzo/leader-pico-della-mirandola.webp', nlPage: 19, nlName: 'Pico della Mirandola' },
  'leader-piero-della-francesca': { file: 'lorenzo/leader-piero-della-francesca.webp', nlPage: 19, nlName: 'Piero della Francesca' },
  'leader-pietro-bembo': { file: 'lorenzo/leader-pietro-bembo.webp', nlPage: 19, nlName: 'Pietro Bembo' },
  'leader-raffaello-sanzio': { file: 'lorenzo/leader-raffaello-sanzio.webp', nlPage: 19, nlName: 'Raffaello Sanzio' },
  'leader-sandro-botticelli': { file: 'lorenzo/leader-sandro-botticelli.webp', nlPage: 19, nlName: 'Sandro Botticelli' },
  'leader-santa-rita': { file: 'lorenzo/leader-santa-rita.webp', nlPage: 19, nlName: 'Santa Rita' },
  'leader-sigismondo-malatesta': { file: 'lorenzo/leader-sigismondo-malatesta.webp', nlPage: 19, nlName: 'Sigismondo Malatesta' },
  'leader-sisto-iv': { file: 'lorenzo/leader-sisto-iv.webp', nlPage: 19, nlName: 'Sisto IV' },
  'leader-tomas-de-torquemada': { file: 'lorenzo/leader-tomas-de-torquemada.webp', nlPage: 19, nlName: 'Tomas de Torquemada' },
}
