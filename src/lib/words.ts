// eslint-disable-next-line @typescript-eslint/no-require-imports
const allWords: string[] = require("an-array-of-english-words");

export type WordLength = 4 | 5 | 6 | 7 | 8;
export const VALID_LENGTHS: WordLength[] = [4, 5, 6, 7, 8];
export const DEFAULT_LENGTH: WordLength = 5;

export function getMaxGuesses(length: WordLength): number {
  return length + 1;
}

// Full dictionary filtered by length — used to validate guesses
const dictionary: Record<number, Set<string>> = {};
for (const word of allWords as string[]) {
  const l = word.length;
  if (l >= 4 && l <= 8) {
    if (!dictionary[l]) dictionary[l] = new Set();
    dictionary[l].add(word.toLowerCase());
  }
}

// Curated answer pools — common, recognisable words only
// These are the words that can be chosen as the daily answer.
const ANSWERS: Record<WordLength, string[]> = {
  4: [
    "able","acid","aged","also","area","army","away","baby","back","ball",
    "band","bank","base","bath","bear","beat","been","bell","best","bird",
    "blow","blue","boat","body","bold","bone","book","born","both","bowl",
    "bulk","burn","busy","call","calm","came","card","care","case","cash",
    "cast","cave","chat","chin","chip","city","clam","clap","claw","clay",
    "clip","club","coal","coat","code","coil","cold","come","cook","cool",
    "cope","copy","core","corn","cost","coup","crew","crop","cure","curl",
    "cute","dark","data","date","dawn","days","dead","deal","dean","dear",
    "debt","deep","deny","desk","diet","dirt","disk","dive","does","done",
    "door","dose","down","draw","drew","drip","drop","drug","drum","dual",
    "dull","dumb","dump","dusk","dust","duty","each","earn","ease","east",
    "easy","edge","else","even","ever","evil","exam","face","fact","fail",
    "fair","fall","fame","farm","fast","fate","feed","feel","feet","fell",
    "felt","file","fill","film","find","fine","fire","firm","fish","fist",
    "five","flag","flat","flew","flip","flow","foam","fold","folk","fond",
    "font","food","fool","foot","ford","fore","fork","form","fort","foul",
    "four","free","from","fuel","full","fund","fuse","gain","game","gave",
    "gaze","gear","gift","girl","give","glad","glow","glue","goal","goes",
    "gold","golf","gone","good","gown","grab","grew","grey","grid","grin",
    "grip","grow","gulf","gust","guys","hack","hair","half","hall","halt",
    "hand","hang","hard","harm","hate","have","head","heal","heap","heat",
    "heel","held","help","here","hero","hide","high","hill","hint","hire",
    "hold","hole","home","hood","hook","hope","horn","host","hour","huge",
    "hung","hunt","hurt","idea","idle","inch","into","iron","item","jail",
    "join","joke","jump","just","keen","keep","kick","kill","kind","king",
    "kiss","knew","knit","knob","know","lack","lady","laid","lake","land",
    "lane","lark","last","late","lawn","lead","lean","leap","left","lend",
    "less","life","lift","like","limb","lime","line","link","list","live",
    "load","loan","lock","loft","logo","lone","long","look","loop","lord",
    "lore","lose","loss","lost","loud","love","luck","lung","lure","lurk",
    "made","mail","main","make","many","mark","mass","math","meal","mean",
    "meat","meet","melt","mesh","mild","milk","mill","mind","mine","mint",
    "miss","mist","mode","mood","moon","more","most","move","much","must",
    "nail","name","navy","near","neck","need","next","nice","nine","node",
    "norm","note","noun","null","obey","odds","oven","over","page","paid",
    "pain","pair","park","part","pass","past","path","pave","peak","peel",
    "peer","pick","pile","pill","pine","pink","pipe","plan","play","plot",
    "plug","plus","poem","pole","poll","pond","pool","poor","port","post",
    "pour","pray","prey","pull","pump","pure","push","rack","rain","rake",
    "ramp","rang","rank","rare","rate","read","real","reap","reed","rely",
    "rent","rest","rice","rich","ride","ring","rise","risk","road","rock",
    "role","roll","roof","room","root","rope","rose","ruin","rule","rush",
    "rust","safe","sage","said","sail","sake","salt","same","sand","save",
    "seal","seam","seat","seed","seek","seem","self","sell","send","shed",
    "shin","ship","shoe","shop","shot","show","sick","side","sigh","silk",
    "sing","sink","site","size","skin","skip","slam","slap","slim","slip",
    "slow","slug","snap","snow","soak","soap","soar","sock","soft","soil",
    "sold","sole","some","song","soon","sort","soul","soup","span","spin",
    "spit","spot","spur","star","stay","stem","step","stir","stop","stub",
    "such","suit","sung","sunk","swap","tail","take","tale","tall","tank",
    "tape","task","team","tear","tell","tend","term","test","than","that",
    "them","then","they","thin","thus","tide","tied","tier","tile","time",
    "tire","toll","told","tone","took","tool","torn","toss","tour","town",
    "trek","trim","true","tube","tuck","tune","turn","twin","type","unit",
    "unto","used","user","vary","vast","vein","very","vest","vibe","view",
    "void","vole","volt","vote","wade","wage","wake","walk","wall","wand",
    "want","ward","warm","warp","wash","wave","weak","wear","weed","well",
    "went","were","west","what","when","whom","wide","wild","will","wind",
    "wine","wing","wink","wire","wise","wish","with","wolf","wood","wool",
    "word","wore","work","worm","worn","wrap","yard","year","your","zero",
    "zone","zoom",
  ],
  5: [
    "about","abuse","actor","acute","admit","adopt","adult","after","again",
    "agree","ahead","alarm","album","alert","alien","align","alike","alive",
    "alley","allow","alone","along","alter","angel","anger","angle","angry",
    "anime","ankle","annex","apart","apple","apply","arena","argue","arise",
    "array","asset","atlas","attic","audio","audit","avoid","awake","award",
    "aware","awful","badly","basic","basis","batch","beach","began","begin",
    "being","below","bench","bible","birth","black","blade","blame","bland",
    "blank","blaze","bleed","blend","bless","blind","block","blood","bloom",
    "blown","board","bonus","bound","boxer","brain","brand","brave","break",
    "breed","bribe","brick","bride","brief","bring","broad","broke","brown",
    "brush","buddy","build","built","bunch","burst","buyer","cabin","camel",
    "candy","carry","catch","cause","chain","chair","chaos","charm","cheap",
    "check","chess","chest","chief","child","china","chunk","civic","civil",
    "claim","class","clean","clear","clerk","click","cliff","climb","cling",
    "clock","close","cloud","coach","coast","cobra","comic","comma","coral",
    "could","count","court","cover","crack","craft","crane","crash","crazy",
    "cream","crime","cross","crowd","crown","crush","cycle","daily","dance",
    "datum","debut","delta","depot","depth","derby","devil","digit","dirty",
    "disco","ditch","diver","dizzy","dodge","doing","doubt","dough","dover",
    "draft","drain","drama","drank","drape","drawn","dream","dress","dried",
    "drift","drink","drive","drone","drove","drunk","dryer","dummy","dunce",
    "eager","eagle","early","earth","eight","elect","elite","email","empty",
    "enemy","enjoy","enter","entry","equal","error","essay","event","every",
    "exact","exist","extra","faint","faith","false","fancy","fatal","feast",
    "fence","fever","fewer","fifty","fight","flair","flame","flask","flesh",
    "float","flood","floor","flour","fluid","fluke","flute","focal","focus",
    "force","forge","forum","found","frame","frank","fraud","fresh","front",
    "froze","fruit","fully","funny","ghost","giant","given","gland","glass",
    "gloom","glove","going","grace","grade","grain","grand","grant","grasp",
    "grass","grave","great","green","greet","grief","grind","groan","group",
    "grove","grown","guard","guess","guest","guide","guild","guile","guise",
    "gusto","habit","happy","harsh","haven","heart","heavy","hedge","hello",
    "hence","herbs","hinge","hippo","homer","honey","honor","hotel","house",
    "human","humor","hurry","hyena","ideal","image","imply","inbox","index",
    "indie","infer","inner","input","intel","intro","irony","issue","ivory",
    "joker","jolly","judge","juice","juicy","jumbo","kayak","kneel","knife",
    "knock","known","label","lance","large","laser","later","laugh","layer",
    "learn","lease","leave","legal","lemon","level","light","limit","liver",
    "local","lodge","logic","lousy","lover","lower","lucky","lunch","lyric",
    "magic","major","maker","maple","march","match","mayor","media","mercy",
    "merge","metal","might","minor","minus","mixed","model","money","month",
    "moral","motor","motto","mount","mouse","mouth","movie","muddy","music",
    "nadir","naive","nerve","never","night","ninja","noble","noise","north",
    "novel","nurse","nylon","occur","ocean","offer","often","olive","onion",
    "onset","order","other","ought","outer","owner","oxide","ozone","paint",
    "panic","paper","patch","pause","peace","penny","perch","phase","phone",
    "photo","piano","piece","pilot","pitch","pixel","pizza","place","plain",
    "plane","plant","plate","plaza","plead","plumb","plume","plunge","point",
    "poker","polar","poppy","posed","power","press","price","pride","prime",
    "print","prior","prize","probe","proof","prose","proud","prove","psalm",
    "queen","query","queue","quick","quiet","quite","quota","quote","rabbi",
    "radar","radio","raise","rally","ranch","range","rapid","ratio","reach",
    "react","ready","realm","rebel","refer","reign","relax","repay","reset",
    "resin","rider","ridge","rifle","right","rigid","risky","river","robot",
    "rocky","rouge","rough","round","route","rover","royal","rugby","ruler",
    "rural","sadly","saint","salad","sauce","scale","scare","scene","score",
    "scout","seize","serve","seven","shaft","shake","shall","shame","shape",
    "share","shark","sharp","sheep","sheer","shelf","shell","shift","shirt",
    "shock","shore","short","shout","shrug","sight","since","sixth","sixty",
    "skill","slave","sleep","slice","slide","slope","smart","smash","smell",
    "smile","smoke","snake","solar","solid","solve","sorry","south","space",
    "spare","spark","speak","spend","spice","spike","spine","spite","split",
    "spoke","spoon","sport","spray","squad","stack","staff","stage","stain",
    "stake","stale","stall","stand","stare","start","state","stave","steal",
    "steam","steep","steer","stern","stick","stiff","still","stomp","stone",
    "store","storm","story","stove","strap","straw","stray","strip","stuck",
    "study","stuff","stump","style","sugar","suite","sunny","super","surge",
    "swamp","swear","sweep","sweet","swept","swift","swing","sword","table",
    "taken","taste","teeth","theft","theme","there","these","thick","thing",
    "think","third","thorn","those","three","threw","throw","thumb","tiger",
    "timer","tired","title","today","token","topic","total","touch","tough",
    "towel","tower","toxic","track","trade","trail","train","trait","trash",
    "treat","trend","trial","trick","troop","trove","truck","truly","trust",
    "truth","tumor","twist","under","union","unity","until","upper","upset",
    "urban","usage","usual","valid","value","valve","video","vigor","viral",
    "virus","visit","vital","vivid","vocal","voice","voter","wagon","watch",
    "water","weigh","weird","whale","wheel","where","which","while","white",
    "whole","whose","widow","witch","woman","women","world","worry","worse",
    "worst","worth","would","wound","wrath","write","wrote","yacht","young",
    "yours","youth","zebra",
  ],
  6: [
    "accent","accept","access","across","action","active","actual","adding",
    "affect","afford","ageing","agency","agenda","almost","always","amount",
    "animal","annual","answer","anyone","anyway","appear","around","arrive",
    "artist","aspect","assert","assign","attach","attack","attend","author",
    "autumn","banner","battle","beauty","became","become","before","behind",
    "belief","belong","better","beyond","bitter","blanks","bridge","bright",
    "broken","budget","burden","buyers","called","camera","cannot","career",
    "castle","caught","center","chance","change","charge","choice","chosen",
    "circle","client","combat","coming","common","comply","couple","create",
    "credit","crisis","custom","debate","decide","degree","demand","depend",
    "deploy","design","desire","detail","dinner","direct","dollar","domain",
    "double","driven","during","effect","effort","either","emerge","energy",
    "engage","engine","enough","ensure","entire","escape","ethnic","events",
    "evolve","except","expand","expect","export","extend","factor","failed",
    "famous","farmer","faster","father","figure","filter","finger","finish",
    "follow","former","format","foster","friend","frozen","future","garden",
    "gender","global","golden","ground","growth","handle","happen","health",
    "height","hidden","higher","hollow","honest","horror","impact","import",
    "income","indoor","inform","inside","intent","invest","island","itself",
    "jigsaw","joined","joyful","junior","jungle","kernel","launch","leader",
    "league","legacy","lesson","letter","lights","likely","linear","linger",
    "listen","little","living","locate","London","longer","looked","losing",
    "market","master","matter","medium","member","method","middle","mirror",
    "mobile","modern","moment","mostly","mother","motion","muscle","mutual",
    "narrow","nature","nearby","nearly","needed","neither","nested","normal",
    "notice","notion","number","object","office","online","opener","option",
    "orange","origin","output","people","period","permit","phrase","planet",
    "player","plenty","plural","police","policy","portal","prefer","pretty",
    "profit","prompt","proper","public","pursue","puzzle","rabbit","random",
    "rather","reader","reason","recent","region","reject","remain","remote",
    "render","repair","repeat","report","result","return","reveal","review",
    "rocket","rollup","rowing","safety","sample","school","season","second",
    "secret","select","series","served","settle","should","silver","simple",
    "single","sister","skills","slight","smooth","socket","source","square",
    "stable","static","steady","status","sticky","stream","street","strict",
    "strike","string","strong","studio","submit","sudden","switch","symbol",
    "system","talent","target","throne","ticket","timely","timing","toggle",
    "toilet","toward","travel","trying","tunnel","typing","unique","unless",
    "update","upload","useful","valley","vector","vendor","viewer","violet",
    "vision","visual","volume","weekly","weight","window","winter","within",
    "wonder","worker","writer","yellow",
  ],
  7: [
    "ability","absence","account","achieve","acquire","address","advance",
    "adverse","against","airport","another","anxiety","anyone","applied",
    "average","awesome","becomes","between","brother","brought","cabinet",
    "captain","capture","careful","catalog","central","century","certain",
    "chapter","charity","charter","citizen","climate","cluster","collect",
    "college","comfort","command","comment","company","concept","concern",
    "conduct","connect","contain","content","context","control","convert",
    "country","courage","current","damages","dataset","dealing","decided",
    "decline","default","deliver","depends","deplete","desktop","destroy",
    "develop","digital","disease","display","distort","disturb","divided",
    "economy","element","endless","engaged","enhance","enquiry","examine",
    "example","exclude","express","extreme","failure","fantasy","federal",
    "feature","feeling","fiction","finance","foreign","forward","freedom",
    "further","general","history","holiday","housing","however","imagine",
    "improve","include","initial","instead","journey","keyword","kitchen",
    "knowing","largely","license","limited","looking","machine","managed",
    "measure","medical","mention","message","million","minimum","mistake",
    "monitor","monthly","morning","nothing","million","network","observe",
    "opinion","options","outside","passage","pattern","percent","perform",
    "picture","popular","problem","process","produce","project","protect",
    "purpose","qualify","quarter","rapidly","reality","receive","recover",
    "release","replace","require","resolve","respect","restore","results",
    "running","section","segment","service","session","setting","several",
    "similar","society","startup","station","storage","student","subject",
    "success","suggest","summary","support","surface","tactics","teacher",
    "through","tonight","totally","tourist","traffic","trouble","turning",
    "typical","uniform","upgrade","version","village","visible","western",
    "whether","without","working","writing",
  ],
  8: [
    "absolute","abstract","accuracy","achieved","acquired","addition",
    "adequate","advances","advisory","affected","alphabet","although",
    "analysis","approach","approval","argument","assembly","assessed",
    "attached","attempts","audience","backbone","balanced","baseline",
    "behavior","benefits","calendar","campaign","capacity","category",
    "centered","champion","changing","channels","chemical","children",
    "combined","complete","conclude","concrete","conflict","consider",
    "consumer","contract","contrast","coverage","creative","criminal",
    "critical","customer","database","deadline","decision","delivery",
    "describe","detailed","dialogue","digital","directly","disaster",
    "discover","document","download","duration","educated","election",
    "elements","emerging","emphasis","employed","engineer","enhanced",
    "enormous","entrance","evaluate","everyone","evidence","exercise",
    "explicit","extended","external","familiar","feedback","football",
    "forecast","fragment","frequent","function","generate","guidance",
    "hardware","headline","heritage","hospital","identify","increase",
    "indicate","industry","informed","instance","interact","interest",
    "internal","isolated","launched","learning","likewise","location",
    "majority","material","maximize","measured","merchant","midnight",
    "minimize","misplace","moderate","momentum","multiply","national",
    "negative","notebook","numerous","observed","obtained","official",
    "opposite","optimize","ordinary","organize","original","overview",
    "parallel","password","platform","positive","possible","powerful",
    "practice","previous","priority","probable","progress","proposal",
    "provided","purchase","rational","reaching","register","relation",
    "relative","relevant","reliable","reminder","required","research",
    "resource","response","restrict","retrieve","scenario","schedule",
    "security","separate","sequence","shortage","snapshot","software",
    "solution","specific","standard","strength","strategy","struggle",
    "suitable","supplied","survival","tendency","terminal","together",
    "tomorrow","training","transfer","treasury","ultimate","umbrella",
    "universe","valuable","verified","vertical","wildlife","wireless",
  ],
};

export function isValidGuess(word: string, length: WordLength): boolean {
  const w = word.toLowerCase();
  if (w.length !== length) return false;
  return (dictionary[length]?.has(w) ?? false) || ANSWERS[length].includes(w);
}

export function getAnswerPool(length: WordLength): string[] {
  return ANSWERS[length];
}

export function getDailyWord(length: WordLength): string {
  const epoch = new Date("2025-01-01").getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayIndex = Math.floor((today.getTime() - epoch) / 86400000);
  // Different offset per length so each category has a different word
  const offset = (length - 4) * 97;
  const pool = ANSWERS[length];
  return pool[(dayIndex + offset) % pool.length];
}

export type LetterState = "correct" | "present" | "absent" | "empty";

export interface GuessResult {
  letter: string;
  state: LetterState;
}

export function evaluateGuess(guess: string, answer: string): GuessResult[] {
  const len = answer.length;
  const result: GuessResult[] = Array.from({ length: len }, (_, i) => ({
    letter: guess[i],
    state: "absent" as LetterState,
  }));

  const answerLetters = answer.split("");
  const guessLetters = guess.split("");

  // First pass: correct positions
  guessLetters.forEach((letter, i) => {
    if (letter === answerLetters[i]) {
      result[i].state = "correct";
      answerLetters[i] = "#";
    }
  });

  // Second pass: present but wrong position
  guessLetters.forEach((letter, i) => {
    if (result[i].state === "correct") return;
    const idx = answerLetters.indexOf(letter);
    if (idx !== -1) {
      result[i].state = "present";
      answerLetters[idx] = "#";
    }
  });

  return result;
}

const HISTORY_SIZE = 30;
const isClient = typeof window !== "undefined";

function loadWordHistory(len: number): string[] {
  if (!isClient) return [];
  try { return JSON.parse(localStorage.getItem(`wordies_history_${len}`) ?? "[]"); }
  catch { return []; }
}

function saveWordHistory(len: number, history: string[]): void {
  if (!isClient) return;
  try { localStorage.setItem(`wordies_history_${len}`, JSON.stringify(history)); }
  catch { /* ignore */ }
}

export function getNextWord(length: WordLength): string {
  const history = loadWordHistory(length);
  const excluded = new Set(history);
  const pool = ANSWERS[length].filter((w) => !excluded.has(w));
  // If somehow the entire pool is in history, start fresh
  const candidates = pool.length > 0 ? pool : ANSWERS[length];
  const word = candidates[Math.floor(Math.random() * candidates.length)];
  saveWordHistory(length, [...history, word].slice(-HISTORY_SIZE));
  return word;
}
