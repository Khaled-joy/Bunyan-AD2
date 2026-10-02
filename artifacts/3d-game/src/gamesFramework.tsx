import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import {
  Activity, ArrowLeft, ArrowRight, BarChart3, BookOpen, Brain, Check,
  ChevronRight, Compass, Crown, Drama, GitBranch, Layers3, Leaf,
  AlertTriangle, Paintbrush, Puzzle, Save, Scale, Send, Sparkles, Timer, Trophy, Users, type LucideIcon,
} from 'lucide-react';

export type FrameworkLang = 'en' | 'ar';
type Copy = { en: string; ar: string };
type IconName = LucideIcon;

const c = (en: string, ar: string): Copy => ({ en, ar });
const text = (value: Copy, lang: FrameworkLang) => value[lang];

export type GameCategory = {
  slug: string;
  icon: IconName;
  name: Copy;
  test: Copy;
  subTypes: Copy[];
  how: Copy;
  gains: Copy;
  data: Copy;
  note?: Copy;
};

export const gameCategories: GameCategory[] = [
  {
    slug: 'role-based', icon: Drama,
    name: c('Role-based', 'قائمة على الأدوار'),
    test: c('Is the player someone else?', 'هل يتقمص اللاعب شخصاً آخر؟'),
    subTypes: [c('Historical figure', 'شخصية تاريخية'), c('Professional role', 'دور مهني'), c('Perspective-switching', 'تبديل المنظور')],
    how: c("The player is handed a character and a brief — a merchant in a historical port, an engineer on a build site — and sees the world only through that person's eyes and knowledge. A session runs 10 to 15 minutes: read the situation, speak with two or three characters, make the calls the role requires, then watch the consequences play out and learn how the real person acted.", 'يُمنح اللاعب شخصية وموجزاً — تاجراً في ميناء تاريخي أو مهندساً في موقع بناء — ويرى العالم من خلال عيني تلك الشخصية ومعرفتها فقط. تستغرق الجلسة من 10 إلى 15 دقيقة: يقرأ الموقف، ويتحدث مع شخصيتين أو ثلاث، ويتخذ القرارات التي يتطلبها الدور، ثم يشاهد النتائج ويتعلم كيف تصرف الشخص الحقيقي.'),
    gains: c('Perspective-taking and empathy. An understanding that decisions are shaped by the information available at the time, not by hindsight. Practice at reasoning inside constraints that are not their own.', 'تنمية القدرة على تبني وجهات النظر والتعاطف. وفهم أن القرارات تتشكل بالمعلومات المتاحة في حينها، لا بما نعرفه لاحقاً. والتدرب على التفكير داخل قيود ليست قيود اللاعب.'),
    data: c('Decisions made from a fixed viewpoint rather than the player\'s own · tone and word choice when speaking as the character · whether the role\'s constraints are respected or hindsight leaks in · handling of authority, subordinates and disagreement · value consistency when the role changes.', 'القرارات المتخذة من منظور ثابت لا من منظور اللاعب · النبرة واختيار الكلمات عند التحدث بصفة الشخصية · احترام قيود الدور أو تسرب معرفة ما بعد الحدث · التعامل مع السلطة والمرؤوسين والاختلاف · اتساق القيم عند تغير الدور.'),
  },
  {
    slug: 'scenario-based', icon: GitBranch,
    name: c('Scenario-based', 'قائمة على السيناريو'),
    test: c('Is the choice set closed?', 'هل مجموعة الخيارات مغلقة؟'),
    subTypes: [c('Limited-choice dilemma', 'معضلة محدودة الخيارات'), c('Card-based decision', 'قرار قائم على البطاقات'), c('Timed crisis', 'أزمة محددة بوقت')],
    how: c('A situation opens with a short setup and three or four options — never more, and never a free-text answer. The player picks, the story moves, and the option not taken is gone for good. A session is eight to twelve of these strung together, closing with a summary of the path taken next to the paths that were available.', 'يبدأ الموقف بإعداد قصير وثلاثة أو أربعة خيارات — لا أكثر، ولا إجابة نصية حرة. يختار اللاعب، وتتقدم القصة، ويختفي الخيار الذي لم يُتخذ نهائياً. تتكون الجلسة من ثمانية إلى اثني عشر موقفاً متتابعاً، وتختتم بملخص للمسار المتخذ إلى جانب المسارات التي كانت متاحة.'),
    gains: c('Judgement under constraint. A concrete sense that choices carry consequences and cannot be undone. Practice at weighing competing pressures when no option is fully satisfying.', 'حسن التقدير تحت القيود. وإدراك ملموس أن الخيارات تحمل عواقب ولا يمكن التراجع عنها. والتدرب على موازنة الضغوط المتنافسة عندما لا يكون أي خيار مُرضياً بالكامل.'),
    data: c('Which branch, out of exactly which alternatives · time to first move and time to commit · consistency across matched dilemmas planted far apart in the session · whether information is gathered before deciding · reasoning under competing pressures.', 'أي فرع من بين أي بدائل بالضبط · الوقت حتى الحركة الأولى ووقت الالتزام · الاتساق عبر معضلات متطابقة موزعة بعيداً في الجلسة · جمع المعلومات قبل اتخاذ القرار · التفكير تحت الضغوط المتنافسة.'),
  },
  {
    slug: 'simulation-strategy', icon: Crown,
    name: c('Simulation / Strategy', 'المحاكاة / الاستراتيجية'),
    test: c('Is a system managed over time?', 'هل تتم إدارة نظام عبر الزمن؟'),
    subTypes: [c('Resource allocation', 'تخصيص الموارد'), c('Turn-based', 'قائم على الأدوار'), c('Tower defense', 'الدفاع عن البرج'), c('Tycoon', 'إدارة المشاريع')],
    how: c('The player is given a system to run — a farm, a city block, a small budget — and a fixed number of turns. Each turn they allocate what they have, press next, and watch the system respond. Nothing resets, so turn nine is shaped by turn two. Sessions are longer, 20 to 30 minutes, and end in a state rather than a score.', 'يُعطى اللاعب نظاماً يديره — مزرعة أو جزءاً من مدينة أو ميزانية صغيرة — وعدداً ثابتاً من الأدوار. في كل دور يوزع ما لديه، ويضغط التالي، ويراقب استجابة النظام. لا شيء يُعاد ضبطه، لذلك يتشكل الدور التاسع بالدور الثاني. الجلسات أطول، من 20 إلى 30 دقيقة، وتنتهي بحالة لا بدرجة.'),
    gains: c('Systems thinking. An understanding of trade-offs, delayed consequences and cause and effect across time. Planning further ahead than the next move.', 'التفكير المنظومي. وفهم المفاضلات والعواقب المؤجلة والسبب والنتيجة عبر الزمن. والتخطيط لما هو أبعد من الخطوة التالية.'),
    data: c('Trade-offs made and what gets sacrificed first · short-term versus long-term weighting · risk appetite as the system state worsens · recovery behaviour after a bad position · shortcuts taken when a score is the visible metric.', 'المفاضلات وما يتم التضحية به أولاً · ترجيح المدى القصير مقابل المدى الطويل · تقبل المخاطر مع تدهور حالة النظام · سلوك التعافي بعد وضع سيئ · الاختصارات المتخذة عندما تكون الدرجة هي المقياس الظاهر.'),
  },
  {
    slug: 'puzzle', icon: Puzzle,
    name: c('Puzzle', 'الألغاز'),
    test: c('Is there one correct answer?', 'هل توجد إجابة صحيحة واحدة؟'),
    subTypes: [c('Logic puzzle', 'لغز منطقي'), c('Escape room', 'غرفة هروب'), c('Mystery / detective', 'غموض / تحقيق'), c('Spatial', 'مكاني')],
    how: c('One screen, one correct answer, and everything needed to reach it already visible. The player manipulates, tests and retries as often as they like; hints exist but have to be asked for. A session is a ladder of five to eight puzzles that get harder, tuned so that almost every player stalls at least once before the end.', 'شاشة واحدة وإجابة صحيحة واحدة، وكل ما يلزم للوصول إليها ظاهر بالفعل. يتلاعب اللاعب ويختبر ويعيد المحاولة كما يشاء؛ توجد تلميحات لكن يجب طلبها. تتكون الجلسة من سلم من خمسة إلى ثمانية ألغاز تزداد صعوبة، ومضبوطة بحيث يتوقف كل لاعب تقريباً مرة واحدة على الأقل قبل النهاية.'),
    gains: c('Structured problem solving and persistence. The experience of being stuck and working through it, which is where most of the learning in this category sits.', 'حل المشكلات بطريقة منظمة والمثابرة. وتجربة التعثر والعمل على تجاوزه، حيث يكمن معظم التعلم في هذه الفئة.'),
    data: c('Time to solve, number of attempts and hint usage · solution path, systematic testing versus brute force · persistence after repeated failure · hypothesis formation and revision from evidence · confidence versus correctness at the moment of committing.', 'وقت الحل وعدد المحاولات واستخدام التلميحات · مسار الحل والاختبار المنهجي مقابل القوة الغاشمة · المثابرة بعد الفشل المتكرر · تكوين الفرضيات ومراجعتها بناء على الأدلة · الثقة مقابل الصحة لحظة الالتزام بالإجابة.'),
  },
  {
    slug: 'mini-games', icon: Timer,
    name: c('Mini games', 'الألعاب المصغرة'),
    test: c('Short, scored, repeatable?', 'قصيرة، محسوبة، قابلة للتكرار؟'),
    subTypes: [c('Quiz', 'اختبار'), c('Word', 'كلمات'), c('Matching', 'مطابقة'), c('Sorting', 'فرز'), c('Sequencing', 'ترتيب'), c('Spot-the-difference', 'اكتشاف الاختلاف'), c('Arcade', 'أركيد')],
    how: c('Sixty seconds each: answer as many as you can, match the pairs, put the steps in order, tap what changed. Score and personal best appear the moment the timer stops, and replay is one tap away. These sit between the longer activities to break the rhythm, and one is placed at the very start of a session to establish a baseline for that player.', 'ستون ثانية لكل لعبة: أجب عن أكبر عدد ممكن، وطابق الأزواج، ورتب الخطوات، واضغط ما تغير. تظهر الدرجة وأفضل نتيجة شخصية فور توقف المؤقت، وتصبح الإعادة بضغطة واحدة. توضع هذه الألعاب بين الأنشطة الأطول لكسر الإيقاع، وتوضع واحدة في بداية الجلسة تماماً لإنشاء خط أساس لذلك اللاعب.'),
    gains: c('Fluency and recall through low-stakes repetition. Confidence, because failure costs seconds rather than progress.', 'الطلاقة والاستدعاء من خلال التكرار منخفض المخاطر. والثقة، لأن الفشل يكلف ثواني لا تقدماً.'),
    data: c('Knowledge retention and topic-level gaps · speed-accuracy trade-off and where the player sits on it · working memory span and recall after a delay · which items get grouped or ordered wrongly, the misconception map · reaction time, fatigue curve and rate of improvement.', 'احتفاظ المعرفة والفجوات على مستوى الموضوع · المفاضلة بين السرعة والدقة وموقع اللاعب عليها · سعة الذاكرة العاملة والاستدعاء بعد تأخير · العناصر التي تُجمع أو تُرتب خطأ، أي خريطة التصورات الخاطئة · زمن الاستجابة ومنحنى التعب ومعدل التحسن.'),
    note: c('This category also carries the calibration task — the short first-login exercise from which touch accuracy and simple reaction time are estimated, so that every later timing-based measure is read against that player\'s own baseline rather than confounded with device and motor competence.', 'تحمل هذه الفئة أيضاً مهمة المعايرة — وهي تمرين تسجيل الدخول الأول القصير الذي تُقدّر منه دقة اللمس وزمن الاستجابة البسيط، حتى تُقرأ كل قياسات التوقيت اللاحقة مقارنة بخط أساس اللاعب نفسه، لا متأثرة بالجهاز والمهارة الحركية.'),
  },
  {
    slug: 'creative', icon: Paintbrush,
    name: c('Creative', 'الإبداع'),
    test: c('Does the player produce something?', 'هل ينتج اللاعب شيئاً؟'),
    subTypes: [c('Sandbox / building', 'صندوق رملي / بناء'), c('Storytelling', 'سرد القصص'), c('Design & customisation', 'تصميم وتخصيص')],
    how: c('The player gets a canvas and a set of parts, a loose brief, and no correct answer. They build, rearrange, undo and save at their own pace. Sessions are open-ended and end when the player decides they are finished. Saved pieces can be reopened in a later session, and shown to others if the player chooses to share them.', 'يحصل اللاعب على لوحة ومجموعة أجزاء وموجز مرن، ولا توجد إجابة صحيحة. يبني ويرتب ويتراجع ويحفظ بالوتيرة التي يختارها. الجلسات مفتوحة وتنتهي عندما يقرر اللاعب أنه انتهى. يمكن إعادة فتح القطع المحفوظة في جلسة لاحقة وعرضها على الآخرين إذا اختار اللاعب مشاركتها.'),
    gains: c('Self-expression and ownership. Design thinking: setting a goal, trying something, and revising it. Pride in an artefact that is theirs.', 'التعبير عن الذات والملكية. والتفكير التصميمي: تحديد هدف وتجربة شيء ومراجعته. والفخر بعمل يخص اللاعب.'),
    data: c('Originality and willingness to depart from the template · goals the player sets when none are given · iteration behaviour — refine, restart or abandon · themes and values projected into what they author · time invested with no external reward on offer.', 'الأصالة والاستعداد للابتعاد عن القالب · الأهداف التي يحددها اللاعب عندما لا تُعطى له أهداف · سلوك التكرار — تحسين أو إعادة بدء أو ترك · الموضوعات والقيم التي يسقطها في ما يؤلفه · الوقت المستثمر دون مكافأة خارجية معروضة.'),
  },
  {
    slug: 'exploration', icon: Compass,
    name: c('Exploration', 'الاستكشاف'),
    test: c('Does the player find something?', 'هل يجد اللاعب شيئاً؟'),
    subTypes: [c('Adventure / quest with map', 'مغامرة / مهمة مع خريطة'), c('Scavenger & treasure hunt', 'بحث عن الأشياء والكنوز')],
    how: c('A map holds far more places than any one session needs. The player chooses where to go and what to open, and some content only becomes reachable once something else has been found. Nothing is compulsory and nothing is ever marked as missed, so the route through the map belongs entirely to the player.', 'تحتوي الخريطة على أماكن أكثر بكثير مما تحتاجه أي جلسة واحدة. يختار اللاعب إلى أين يذهب وما الذي يفتحه، ولا يصبح بعض المحتوى قابلاً للوصول إلا بعد العثور على شيء آخر. لا شيء إلزامي ولا يُعلّم أي شيء على أنه فائت، لذلك يخص المسار عبر الخريطة اللاعب بالكامل.'),
    gains: c('Curiosity and self-directed learning. Search and clue-interpretation skills. The experience of discovery being earned rather than handed over.', 'الفضول والتعلم الموجه ذاتياً. ومهارات البحث وتفسير الأدلة. وتجربة أن الاكتشاف يُكتسب ولا يُسلّم جاهزاً.'),
    data: c('Route efficiency — explore widely or head straight for the objective · completionism and how much optional content is opened · clue interpretation and search strategy · doors not opened and documents not read, absence as data · real-world movement and collaboration where the game is physical or AR-based.', 'كفاءة المسار — الاستكشاف الواسع أو التوجه مباشرة إلى الهدف · النزعة إلى الإكمال ومقدار المحتوى الاختياري المفتوح · تفسير الأدلة واستراتيجية البحث · الأبواب التي لم تُفتح والوثائق التي لم تُقرأ، فالغياب بيانات · الحركة والتعاون في العالم الحقيقي عندما تكون اللعبة مادية أو قائمة على الواقع المعزز.'),
  },
];

export type GameDomain = {
  slug: string;
  icon: IconName;
  name: Copy;
  covers: Copy;
  headline: Copy;
  evidence: Copy;
  beyond: Copy;
  constraint?: Copy;
};

export const gameDomains: GameDomain[] = [
  {
    slug: 'literacy', icon: BookOpen, name: c('Literacy', 'القراءة والكتابة'),
    covers: c('Covers decoding, fluency, comprehension and numeracy in both Arabic and English. Arabic requires its own item design rather than translation, because reading acquisition in Arabic is shaped by diglossia and by an orthography in which letters change shape by position and short vowels are frequently omitted. Arabic and English decoding are modelled as separate correlated constructs, not one literacy score.', 'تشمل فك الرموز والطلاقة والفهم والحساب باللغتين العربية والإنجليزية. تتطلب العربية تصميم بنود خاصاً بها لا ترجمة، لأن اكتساب القراءة بالعربية يتأثر بالازدواجية اللغوية وبنظام كتابة تتغير فيه أشكال الحروف حسب موقعها وغالباً ما تُحذف حركاتها القصيرة. ويُنمذج فك الرموز بالعربية والإنجليزية كبنيتين مترابطتين منفصلتين، لا كدرجة واحدة للقراءة والكتابة.'),
    headline: c('proficiency rate — the proportion of learners at or above a benchmark.', 'معدل الإتقان — نسبة المتعلمين عند مستوى معياري أو فوقه.'),
    evidence: c('accuracy, fluency, error profile, response latency, hint use.', 'الدقة والطلاقة ونمط الأخطاء وزمن الاستجابة واستخدام التلميحات.'),
    beyond: c('teacher rating; student anxiety and enjoyment; parent report on home literacy context.', 'تقييم المعلم؛ قلق الطالب واستمتاعه؛ تقرير الوالد عن سياق القراءة والكتابة في المنزل.'),
  },
  {
    slug: 'activities', icon: Activity, name: c('Health', 'الصحة'),
    covers: c('Covers movement, sport, active transport, hobbies and sedentary behaviour. This is the domain where game telemetry alone is least adequate, because the behaviour of interest happens off screen. Self-report overestimates activity substantially and the effect worsens with younger children, so the posture is combination rather than substitution: questionnaires establish activity type and weekly distribution, objective measurement quantifies volume.', 'تشمل الحركة والرياضة والتنقل النشط والهوايات والسلوك الخامل. هذا هو المجال الذي تكون فيه بيانات اللعبة وحدها أقل كفاية، لأن السلوك المعني يحدث خارج الشاشة. يبالغ التقرير الذاتي في تقدير النشاط بدرجة كبيرة ويزداد ذلك لدى الأطفال الأصغر، لذلك يكون النهج هو الجمع لا الاستبدال: تحدد الاستبيانات نوع النشاط وتوزيعه الأسبوعي، ويقيس القياس الموضوعي حجمه.'),
    headline: c('guideline adherence rate, corrected for reporting bias.', 'معدل الالتزام بالإرشادات، مصححاً لتحيز الإبلاغ.'),
    evidence: c('in-game logging and challenge completion only.', 'التسجيل داخل اللعبة وإكمال التحديات فقط.'),
    beyond: c('sensor or accelerometer data; student recall; parent enrolment and access data.', 'بيانات المستشعر أو مقياس التسارع؛ تذكر الطالب؛ بيانات تسجيل الوالد وإمكانية الوصول.'),
  },
  {
    slug: 'environment', icon: Leaf, name: c('Environment', 'البيئة'),
    covers: c('Covers food consumption, waste and recycling, water and energy use, climate awareness and pro-environmental behaviour. Reported as three named subscales — knowledge, disposition and behaviour — rather than one number, because an environmentally aware child is not thereby environmentally literate.', 'تشمل استهلاك الطعام والنفايات وإعادة التدوير واستخدام المياه والطاقة والوعي بالمناخ والسلوك المؤيد للبيئة. ويُبلّغ عنها في ثلاثة مقاييس فرعية مسماة — المعرفة والاستعداد والسلوك — لا في رقم واحد، لأن الطفل الواعي بيئياً ليس بالضرورة مثقفاً بيئياً.'),
    headline: c('environmental literacy composite. The most decision-relevant derived indicator is the knowledge–action gap: the standardised difference between the knowledge and behaviour subscales, identifying where instruction has succeeded and behaviour has not followed.', 'مركب الثقافة البيئية. والمؤشر المشتق الأكثر صلة بالقرار هو فجوة المعرفة والفعل: الفرق المعياري بين مقياسي المعرفة والسلوك، لتحديد المواضع التي نجح فيها التعليم ولم يتبعه السلوك.'),
    evidence: c('sorting accuracy, choice under trade-off, hesitation.', 'دقة الفرز والاختيار في المفاضلة والتردد.'),
    beyond: c('student attitudes; parent household practice; entity infrastructure records.', 'اتجاهات الطالب؛ الممارسة المنزلية لدى الوالد؛ سجلات البنية التحتية للجهة.'),
  },
  {
    slug: 'developmental-skills', icon: Brain, name: c('Developmental skills', 'المهارات النمائية'),
    covers: c('Covers problem solving, persistence, critical thinking, creativity, self-regulation, collaboration and digital literacy. This is the domain where process data from game logs is the primary evidence source rather than a supplement, because these constructs live in how a task is approached rather than in whether it is answered correctly.', 'تشمل حل المشكلات والمثابرة والتفكير النقدي والإبداع والتنظيم الذاتي والتعاون والثقافة الرقمية. هذا هو المجال الذي تكون فيه بيانات العملية من سجلات اللعبة مصدر الأدلة الأساسي لا مكملاً، لأن هذه البنى تظهر في طريقة الاقتراب من المهمة لا في صحة الإجابة وحدها.'),
    headline: c('skills composite.', 'مركب المهارات.'),
    evidence: c('vary-one-thing-at-a-time strategy rate, planning latency before first action, redundant-action rate, persistence after first failure, failure recovery rate, and creativity decomposed into fluency, flexibility and statistical originality.', 'معدل استراتيجية تغيير شيء واحد في كل مرة، وزمن التخطيط قبل الفعل الأول، ومعدل الأفعال الزائدة، والمثابرة بعد الفشل الأول، ومعدل التعافي من الفشل، والإبداع مفككاً إلى الطلاقة والمرونة والأصالة الإحصائية.'),
    beyond: c('teacher ratings that are behaviourally anchored rather than adjectival; student self-regulation scale.', 'تقييمات المعلم المرتكزة إلى السلوك لا الصفات؛ مقياس التنظيم الذاتي للطالب.'),
  },
  {
    slug: 'social-relations', icon: Users, name: c('Social relations', 'العلاقات الاجتماعية'),
    covers: c('Covers peer acceptance, friendship, cooperation, bullying involvement, prosocial behaviour and social cognition. Carries the highest evidential density and the highest ethical risk in the architecture.', 'تشمل قبول الأقران والصداقة والتعاون والتورط في التنمر والسلوك الاجتماعي الإيجابي والإدراك الاجتماعي. وتحمل أعلى كثافة أدلة وأعلى مخاطر أخلاقية في البنية.'),
    headline: c('social connectedness rate.', 'معدل الترابط الاجتماعي.'),
    evidence: c('emotion recognition, prosocial choice, cooperation.', 'التعرف إلى المشاعر والاختيار الاجتماعي الإيجابي والتعاون.'),
    beyond: c('peer nomination; student loneliness; teacher and counsellor observation.', 'ترشيح الأقران؛ وحدة الطالب؛ ملاحظة المعلم والمرشد.'),
    constraint: c('Outputs in this domain are reported as referral rates requiring professional review, never as diagnoses or labels.', 'تُبلّغ مخرجات هذا المجال كمعدلات إحالة تتطلب مراجعة مهنية، وليست تشخيصات أو تسميات أبداً.'),
  },
];

type Tier = { name: Copy; sources: Copy; indicator: Copy; appropriate: Copy; notAppropriate: Copy; supporting: Copy };
export const tiers: Tier[] = [
  {
    name: c('Game-only', 'اللعبة فقط'),
    sources: c('Game telemetry', 'بيانات اللعبة'),
    indicator: c('Capability and process', 'القدرة والعملية'),
    appropriate: c('Adaptive difficulty; population monitoring; screening candidates for further assessment', 'الصعوبة التكيفية؛ مراقبة السكان؛ فحص المرشحين لتقييم إضافي'),
    notAppropriate: c('Any decision about an identified child', 'أي قرار بشأن طفل محدد'),
    supporting: c('Tier 1 establishes what a child can do, with an objectivity and continuity no survey achieves, and can be recomputed after every session at negligible cost. Its limitation is interpretive: it establishes a level without establishing a cause, and remains exposed to the risk that the measure reflects game proficiency or device familiarity rather than the intended construct. Two internal controls are mandatory at this tier — a short calibration task at first login, and disengagement filtering that identifies and down-weights rapid guessing.', 'يحدد المستوى الأول ما يستطيع الطفل فعله بموضوعية واستمرارية لا يحققها أي استبيان، ويمكن إعادة حسابه بعد كل جلسة بتكلفة ضئيلة. لكنه يحدد المستوى دون السبب، ويبقى عرضة لأن يعكس القياس إتقان اللعبة أو الألفة مع الجهاز لا البنية المقصودة. وضابطان داخليان إلزاميان هنا — مهمة معايرة قصيرة عند أول تسجيل دخول، وفلترة عدم الانخراط التي تحدد التخمين السريع وتخفض وزنه.'),
  },
  {
    name: c('Game + self-report', 'اللعبة + التقرير الذاتي'),
    sources: c('Game telemetry; student self-report', 'بيانات اللعبة؛ التقرير الذاتي للطالب'),
    indicator: c('Explained capability; first discrepancy indicators', 'قدرة مفسرة؛ مؤشرات التباين الأولى'),
    appropriate: c('Programme design; identifying motivational barriers; class-level review', 'تصميم البرامج؛ تحديد العوائق التحفيزية؛ مراجعة على مستوى الصف'),
    notAppropriate: c('Safeguarding flags; individual clinical referral', 'إشارات الحماية؛ الإحالة السريرية الفردية'),
    supporting: c('Tier 2 adds student self-report delivered inside the game frame as two or three in-narrative check-ins per session, never as an interrupting questionnaire. Telemetry establishes capability; self-report supplies the motivational and attitudinal layer that explains it. A child with low literacy proficiency and high reported anxiety presents a different problem from a child with the same proficiency and no anxiety, and only the second source separates them.', 'يضيف المستوى الثاني التقرير الذاتي للطالب داخل إطار اللعبة من خلال فحصين أو ثلاثة داخل السرد في كل جلسة، وليس استبياناً مقاطعاً. تثبت البيانات القدرة، ويقدم التقرير الذاتي الطبقة التحفيزية والاتجاهية التي تفسرها. الطفل ذو إتقان القراءة المنخفض والقلق المرتفع المبلغ عنه يواجه مشكلة مختلفة عن طفل له الإتقان نفسه دون قلق، والمصدر الثاني وحده يميز بينهما.'),
  },
  {
    name: c('Full multi-source integration', 'تكامل كامل متعدد المصادر'),
    sources: c('Game telemetry; self-report; proxy report; administrative data', 'بيانات اللعبة؛ التقرير الذاتي؛ تقرير الوكيل؛ البيانات الإدارية'),
    indicator: c('Verified, opportunity-adjusted, cross-context indicators', 'مؤشرات موثقة ومعدلة للفرص وعبر السياقات'),
    appropriate: c('Individual case review; equity analysis; policy indicators; referral', 'مراجعة الحالة الفردية؛ تحليل الإنصاف؛ مؤشرات السياسات؛ الإحالة'),
    notAppropriate: c('Autonomous action without human review', 'إجراء مستقل دون مراجعة بشرية'),
    supporting: c('Tier 3 adds proxy report from adults who observe the child where the game cannot reach — teachers, parents, counsellors, programme managers — and administrative data already held by the collaborating entity. Administrative data is distinctive because it imposes no new burden, is often longitudinal, and records opportunity rather than behaviour: a low pro-environmental behaviour score in a school with no recycling infrastructure measures the school, not the child. Tier 3 is the only tier at which cross-context verification is possible, and is therefore required for any indicator bearing consequences for an identified child.', 'يضيف المستوى الثالث تقرير الوكيل من البالغين الذين يلاحظون الطفل حيث لا تصل اللعبة — المعلمين والوالدين والمرشدين ومديري البرامج — والبيانات الإدارية الموجودة لدى الجهة المتعاونة. وتمتاز البيانات الإدارية بأنها لا تفرض عبئاً جديداً، وغالباً ما تكون طولية، وتسجل الفرصة لا السلوك: فدرجة السلوك المؤيد للبيئة المنخفضة في مدرسة بلا بنية لإعادة التدوير تقيس المدرسة لا الطفل. المستوى الثالث هو الوحيد الذي يتيح التحقق عبر السياقات، ولذلك يلزم لأي مؤشر تترتب عليه عواقب لطفل محدد.'),
  },
];

const mergeOperations = [
  { name: c('Composite', 'المركب'), icon: Layers3, definition: c('Weighted mean of sources standardised within cohort, weights set by reliability rather than convenience', 'متوسط مرجح للمصادر المعيارية داخل الفوج، وتحدد الأوزان بالموثوقية لا بالسهولة'), example: c('Environmental literacy composite; developmental skills composite', 'مركب الثقافة البيئية؛ مركب المهارات النمائية') },
  { name: c('Adjustment', 'التعديل'), icon: Scale, definition: c('Residual of the indicator regressed on a confound measured by another source', 'باقي المؤشر بعد انحداره على عامل مربك يقيسه مصدر آخر'), example: c('Anxiety-adjusted literacy ability; opportunity-adjusted environmental behaviour; corrected activity volume', 'قدرة القراءة المعدلة للقلق؛ السلوك البيئي المعدل للفرصة؛ حجم النشاط المصحح') },
  { name: c('Discrepancy', 'التباين'), icon: BarChart3, definition: c('Standardised difference between two sources, interpreted as a construct in its own right', 'الفرق المعياري بين مصدرين، ويفسر كبنية قائمة بذاتها'), example: c('Knowledge–action gap; self-insight index; performance discrepancy between game ability and teacher rating', 'فجوة المعرفة والفعل؛ مؤشر البصيرة الذاتية؛ التباين بين قدرة اللعبة وتقييم المعلم') },
];

const categoryIntro = c('Every game we build belongs to one of seven categories. The category is decided by the game\'s core mechanic, and it determines what kind of evidence the game can produce. Overlaps are recorded as secondary tags, not second categories.', 'تنتمي كل لعبة نبنيها إلى فئة واحدة من سبع فئات. تحدد الفئة آلية اللعبة الأساسية، وتحدد نوع الأدلة التي يمكن للعبة إنتاجها. وتسجل التداخلات كوسوم ثانوية لا كفئات ثانية.');
const domainIntro = c('Games produce evidence. Evidence becomes an indicator only when it is organised into a domain and built to a defined tier of evidential strength. This section sets out the five domains we work across, the three tiers of indicator production, and the three operations by which multiple sources are combined.', 'تنتج الألعاب أدلة. ولا تصبح الأدلة مؤشراً إلا عندما تنظم داخل مجال وتبنى وفق مستوى محدد من القوة الإثباتية. يوضح هذا القسم المجالات الخمسة التي نعمل فيها، والمستويات الثلاثة لإنتاج المؤشرات، والعمليات الثلاث التي تجمع بها المصادر المتعددة.');
const categoryClose = c('No single category produces evidence across every dimension. A finished game usually layers several: one category as the core loop, a second as the framing, and short mini games between beats to give a baseline. The category recorded against a game is the core loop.', 'لا تنتج فئة واحدة أدلة عبر كل الأبعاد. عادة ما تجمع اللعبة المكتملة عدة فئات: فئة كحلقة أساسية، وثانية كإطار، وألعاب مصغرة قصيرة بين المراحل لإنشاء خط أساس. والفئة المسجلة للعبة هي الحلقة الأساسية.');
const domainClose = c('The domains are containers, not a closed list. A new construct is added inside the domain whose evidence needs it matches, and inherits the same integration machinery — which is what keeps indicators from different projects comparable.', 'المجالات حاويات وليست قائمة مغلقة. يضاف البناء الجديد داخل المجال الذي تتطابق احتياجات أدلته معه، ويرث آلية التكامل نفسها — وهذا ما يحافظ على قابلية مقارنة المؤشرات من المشاريع المختلفة.');
const operatingRule = c('No indicator with consequences for an identified child escalates on a single source. Convergence of at least two independent sources is required before an indicator is forwarded for professional action, and a qualified professional reviews it before any action is taken.', 'لا يُصعّد أي مؤشر تترتب عليه عواقب لطفل محدد اعتماداً على مصدر واحد. يلزم تقارب مصدرين مستقلين على الأقل قبل إحالة المؤشر إلى إجراء مهني، ويراجعه مختص مؤهل قبل اتخاذ أي إجراء.');
const mergeClose = c('Disagreement between sources is modelled rather than averaged away. Informants agree only weakly about the same child, and that disagreement carries systematic information about the contexts in which behaviour occurs — the most actionable finding is frequently in the space between two sources rather than in either one.', 'تُنمذج الاختلافات بين المصادر بدلاً من إخفائها بالمتوسط. لا يتفق المخبرون إلا بدرجة ضعيفة بشأن الطفل نفسه، ويحمل هذا الاختلاف معلومات منهجية عن السياقات التي يحدث فيها السلوك — وغالباً ما تكون النتيجة الأكثر قابلية للفعل في المسافة بين مصدرين لا في أي منهما.');

function Arrow({ direction = 'forward' }: { direction?: 'forward' | 'back' }) {
  const Icon = direction === 'back' ? ArrowLeft : ArrowRight;
  return <Icon className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />;
}

function FrameworkHeader({ eyebrow, title, intro, lang }: { eyebrow: Copy; title: Copy; intro: Copy; lang: FrameworkLang }) {
  return <section className="relative overflow-hidden rounded-[30px] bg-[#174b44] p-7 text-[#fff4df] shadow-soft sm:p-10">
    <div className="absolute -end-20 -top-24 h-72 w-72 rounded-full bg-[#f2c95c]/20 blur-2xl" aria-hidden="true" />
    <div className="relative max-w-4xl">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#f2c95c]"><Sparkles className="h-4 w-4" />{text(eyebrow, lang)}</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl font-black leading-[1.02] tracking-[-.04em] sm:text-6xl">{text(title, lang)}</h1>
      <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#b7d1c5]">{text(intro, lang)}</p>
    </div>
  </section>;
}

function IndexCard({ href, icon: Icon, title, eyebrow, children, lang }: { href: string; icon: IconName; title: Copy; eyebrow?: Copy; children: ReactNode; lang: FrameworkLang }) {
  return <Link href={href} className="group block h-full rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-5 shadow-soft transition hover:-translate-y-1 hover:border-[#174b44] focus-visible:-translate-y-1 sm:p-6">
    <article className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e6f1eb] text-[#174b44]"><Icon className="h-6 w-6" aria-hidden="true" /></span>{eyebrow && <span className="rounded-full bg-[#efe4cf] px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#688079]">{text(eyebrow, lang)}</span>}</div>
      <h3 className="mt-5 font-display text-2xl font-bold text-[#174b44]">{text(title, lang)}</h3>
      <div className="mt-3 flex-1 text-sm leading-relaxed text-[#557068]">{children}</div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0b6a79]">{lang === 'ar' ? 'اقرأ التفاصيل' : 'Read details'} <Arrow /></span>
    </article>
  </Link>;
}

type FrameworkSection = 'categories' | 'domains' | 'tiers';

function SectionSwitcher({ active, onJump, lang }: { active: FrameworkSection; onJump: (id: FrameworkSection) => void; lang: FrameworkLang }) {
  return <nav className="sticky top-[78px] z-20 mt-6 rounded-2xl border border-[#d6e2e9] bg-[#e8f4fa]/95 p-2 shadow-soft backdrop-blur-md" aria-label={lang === 'ar' ? 'أقسام إطار الألعاب' : 'Games framework sections'}>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {(['categories', 'domains', 'tiers'] as const).map((id) => <button key={id} type="button" onClick={() => onJump(id)} className={`min-h-12 rounded-xl px-4 py-3 text-sm font-bold transition ${active === id ? 'bg-[#2140a8] text-white shadow-sm' : 'text-[#557068] hover:bg-white hover:text-[#0b6a79]'}`} aria-current={active === id ? 'true' : undefined}>{id === 'categories' ? text(c('Game Categories', 'فئات الألعاب'), lang) : id === 'domains' ? text(c('Domains and Indicators', 'المجالات والمؤشرات'), lang) : text(c('Three cumulative tiers', 'ثلاثة مستويات تراكمية'), lang)}</button>)}
    </div>
  </nav>;
}

export function GamesIndexPage({ lang }: { lang: FrameworkLang }) {
  const [active, setActive] = useState<FrameworkSection>('categories');
  const categoryRef = useRef<HTMLElement>(null);
  const domainRef = useRef<HTMLElement>(null);
  const tierRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id === 'game-categories') setActive('categories');
      if (visible?.target.id === 'domains-indicators') setActive('domains');
      if (visible?.target.id === 'indicator-tiers') setActive('tiers');
    }, { rootMargin: '-120px 0px -55% 0px', threshold: [0, .2, .6] });
    [categoryRef.current, domainRef.current, tierRef.current].forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);
  const jump = (id: FrameworkSection) => {
    const node = id === 'categories' ? categoryRef.current : id === 'domains' ? domainRef.current : tierRef.current;
    node?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };
  return <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12">
    <FrameworkHeader eyebrow={c('Games framework', 'إطار الألعاب')} title={c('Games that produce useful evidence.', 'ألعاب تنتج أدلة مفيدة.')} intro={c('A shared framework for designing learning games, reading what they reveal, and combining evidence responsibly.', 'إطار مشترك لتصميم ألعاب التعلم وقراءة ما تكشفه وجمع الأدلة بمسؤولية.')} lang={lang} />
    <SectionSwitcher active={active} onJump={jump} lang={lang} />
    <section id="game-categories" ref={categoryRef} className="scroll-mt-28 pt-14" aria-labelledby="game-categories-title">
      <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{text(c('Section A', 'القسم أ'), lang)}</p><h2 id="game-categories-title" className="mt-2 font-display text-4xl font-bold text-[#174b44]">{text(c('Game Categories', 'فئات الألعاب'), lang)}</h2><p className="mt-3 text-base leading-relaxed text-[#557068]">{text(categoryIntro, lang)}</p></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{gameCategories.map((category) => <IndexCard key={category.slug} href={`/games/categories/${category.slug}`} icon={category.icon} title={category.name} lang={lang}><p className="font-bold text-[#174b44]">{text(category.test, lang)}</p><p className="mt-2">{text(category.how, lang).split('. ')[0]}.</p></IndexCard>)}</div>
      <p className="mt-8 rounded-2xl border-s-4 border-[#e8755f] bg-[#fff0eb] p-5 text-sm font-semibold leading-relaxed text-[#557068]">{text(categoryClose, lang)}</p>
    </section>
    <section id="domains-indicators" ref={domainRef} className="scroll-mt-28 pt-16" aria-labelledby="domains-title">
      <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#16a7bc]">{text(c('Section B', 'القسم ب'), lang)}</p><h2 id="domains-title" className="mt-2 font-display text-4xl font-bold text-[#174b44]">{text(c('Domains and Indicators', 'المجالات والمؤشرات'), lang)}</h2><p className="mt-3 text-base leading-relaxed text-[#557068]">{text(domainIntro, lang)}</p></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{gameDomains.map((domain) => <IndexCard key={domain.slug} href={`/games/domains/${domain.slug}`} icon={domain.icon} title={domain.name} lang={lang}><p className="font-bold text-[#174b44]">{text(domain.headline, lang)}</p>{domain.constraint && <p className="mt-3 font-semibold text-[#a94d40]">{text(domain.constraint, lang)}</p>}</IndexCard>)}</div>
      <p className="mt-8 text-sm font-semibold leading-relaxed text-[#557068]">{text(domainClose, lang)}</p>
    </section>
    <section id="indicator-tiers" ref={tierRef} className="scroll-mt-28 pt-16" aria-labelledby="indicator-tiers-title">
      <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#c27a12]">{text(c('Indicator production', 'إنتاج المؤشرات'), lang)}</p><h3 id="indicator-tiers-title" className="mt-2 font-display text-3xl font-bold text-[#174b44]">{text(c('Three cumulative tiers', 'ثلاثة مستويات تراكمية'), lang)}</h3></div><Link href="/games/tiers" className="inline-flex items-center gap-2 text-sm font-bold text-[#0b6a79]">{text(c('Read the full tier guide', 'اقرأ دليل المستويات الكامل'), lang)} <Arrow /></Link></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">{tiers.map((tier, index) => <Link key={tier.name.en} href="/games/tiers" className={`rounded-2xl border p-5 transition hover:-translate-y-1 focus-visible:-translate-y-1 ${index === 0 ? 'border-[#c7ded1] bg-[#e6f1eb]' : index === 1 ? 'border-[#a9c7d8] bg-[#e7f8fb]' : 'border-[#d8c37b] bg-[#fff3cc]'}`}><p className="text-xs font-bold uppercase tracking-[.14em] text-[#688079]">Tier {index + 1}</p><h4 className="mt-2 font-display text-xl font-bold text-[#174b44]">{text(tier.name, lang)}</h4><p className="mt-2 text-sm leading-relaxed text-[#557068]">{text(tier.sources, lang)}</p><p className="mt-3 text-xs font-bold text-[#688079]">{text(tier.appropriate, lang)}</p></Link>)}</div>
      </div>
    </section>
  </div>;
}

function Breadcrumbs({ section, current, lang }: { section: Copy; current: Copy; lang: FrameworkLang }) {
  return <nav aria-label={lang === 'ar' ? 'مسار التنقل' : 'Breadcrumb'} className="flex flex-wrap items-center gap-1.5 text-sm text-[#688079]"><Link href="/games" className="font-bold hover:text-[#0b6a79]">{text(c('Games', 'الألعاب'), lang)}</Link><ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /><Link href="/games" className="font-bold hover:text-[#0b6a79]">{text(section, lang)}</Link><ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /><span aria-current="page" className="font-semibold text-[#174b44]">{text(current, lang)}</span></nav>;
}

function Pager({ previous, next, base, lang }: { previous?: GameCategory | GameDomain; next?: GameCategory | GameDomain; base: 'categories' | 'domains'; lang: FrameworkLang }) {
  return <div className="mt-12 grid gap-3 border-t border-[#dfd2bd] pt-6 sm:grid-cols-2">
    {previous ? <Link href={`/games/${base}/${previous.slug}`} className="group rounded-2xl border border-[#dfd2bd] bg-[#fcf8f0] p-4 hover:border-[#174b44]"><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#688079]"><Arrow direction="back" />{text(c('Previous', 'السابق'), lang)}</span><span className="mt-2 block font-display text-lg font-bold text-[#174b44]">{text(previous.name, lang)}</span></Link> : <div />}
    {next ? <Link href={`/games/${base}/${next.slug}`} className="group rounded-2xl border border-[#dfd2bd] bg-[#fcf8f0] p-4 text-start sm:text-end hover:border-[#174b44]"><span className="flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#688079]">{text(c('Next', 'التالي'), lang)}<Arrow /></span><span className="mt-2 block font-display text-lg font-bold text-[#174b44]">{text(next.name, lang)}</span></Link> : <div />}
  </div>;
}

function DetailLayout({ children, lang }: { children: ReactNode; lang: FrameworkLang }) {
  return <div className="mx-auto max-w-[1120px] px-5 py-8 lg:px-10 lg:py-12">{children}</div>;
}

export function CategoryDetailPage({ lang }: { lang: FrameworkLang }) {
  const [, params] = useRoute<{ slug: string }>('/games/categories/:slug');
  const category = gameCategories.find((item) => item.slug === params?.slug);
  if (!category) return <NotFoundFramework lang={lang} />;
  const index = gameCategories.indexOf(category);
  const Icon = category.icon;
  return <DetailLayout lang={lang}><Breadcrumbs section={c('Game Categories', 'فئات الألعاب')} current={category.name} lang={lang} /><Link href="/games#game-categories" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0b6a79]"><Arrow direction="back" />{text(c('Back to Game Categories', 'العودة إلى فئات الألعاب'), lang)}</Link><header className="mt-8 rounded-[28px] bg-[#174b44] p-7 text-[#fff4df] sm:p-10"><div className="flex flex-col gap-5 sm:flex-row sm:items-start"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#f2c95c] text-[#174b44]"><Icon className="h-8 w-8" /></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#f2c95c]">{text(c('Game category', 'فئة اللعبة'), lang)}</p><h1 className="mt-2 font-display text-4xl font-black sm:text-5xl">{text(category.name, lang)}</h1><p className="mt-4 text-lg font-semibold text-[#f7e5a4]">{text(category.test, lang)}</p></div></div><div className="mt-7 flex flex-wrap gap-2">{category.subTypes.map((subType) => <span key={subType.en} className="rounded-full border border-[#71a695] bg-[#2d675d] px-3 py-1.5 text-xs font-bold">{text(subType, lang)}</span>)}</div></header><div className="mt-8 grid gap-5"><DetailSection title={c('How it works', 'كيف تعمل')} value={category.how} lang={lang} /><DetailSection title={c('What the player gains', 'ما الذي يكتسبه اللاعب')} value={category.gains} lang={lang} /><DetailSection title={c('What data is collected', 'ما البيانات التي تُجمع')} value={category.data} lang={lang} />{category.note && <aside className="rounded-2xl border-s-4 border-[#c27a12] bg-[#fff3cc] p-5 text-sm font-semibold leading-relaxed text-[#557068]"><p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-[#79621d]">{text(c('Important note', 'ملاحظة مهمة'), lang)}</p>{text(category.note, lang)}</aside>}</div><Pager previous={gameCategories[index - 1]} next={gameCategories[index + 1]} base="categories" lang={lang} /></DetailLayout>;
}

function DetailSection({ title, value, lang }: { title: Copy; value: Copy; lang: FrameworkLang }) {
  return <section className="rounded-2xl border border-[#dfd2bd] bg-[#fcf8f0] p-6 shadow-soft sm:p-7"><h2 className="flex items-center gap-2 font-display text-2xl font-bold text-[#174b44]"><Check className="h-5 w-5 text-[#16a7bc]" />{text(title, lang)}</h2><p className="mt-4 text-base leading-[1.8] text-[#557068]">{text(value, lang)}</p></section>;
}

export function DomainDetailPage({ lang }: { lang: FrameworkLang }) {
  const [, params] = useRoute<{ slug: string }>('/games/domains/:slug');
  const domain = gameDomains.find((item) => item.slug === params?.slug);
  if (!domain) return <NotFoundFramework lang={lang} />;
  const index = gameDomains.indexOf(domain);
  const Icon = domain.icon;
  return <DetailLayout lang={lang}><Breadcrumbs section={c('Domains and Indicators', 'المجالات والمؤشرات')} current={domain.name} lang={lang} /><Link href="/games#domains-indicators" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0b6a79]"><Arrow direction="back" />{text(c('Back to Domains and Indicators', 'العودة إلى المجالات والمؤشرات'), lang)}</Link><header className="mt-8 flex flex-col gap-5 rounded-[28px] border border-[#a9c7d8] bg-[#e7f8fb] p-7 sm:flex-row sm:items-center sm:p-10"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#16a7bc] text-white"><Icon className="h-8 w-8" /></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0b6a79]">{text(c('Evidence domain', 'مجال الأدلة'), lang)}</p><h1 className="mt-2 font-display text-4xl font-black text-[#174b44] sm:text-5xl">{text(domain.name, lang)}</h1></div></header><div className="mt-8 grid gap-5"><DetailSection title={c('What it covers', 'ما الذي يغطيه')} value={domain.covers} lang={lang} /><DetailSection title={c('Headline indicator', 'المؤشر الرئيسي')} value={domain.headline} lang={lang} /><DetailSection title={c('Primary game evidence', 'أدلة اللعبة الأساسية')} value={domain.evidence} lang={lang} /><DetailSection title={c('Sources required beyond games', 'المصادر المطلوبة خارج الألعاب')} value={domain.beyond} lang={lang} />{domain.constraint && <aside className="rounded-2xl border-s-4 border-[#d8232a] bg-[#fff0eb] p-5 text-sm font-bold leading-relaxed text-[#a94d40]"><p className="mb-2 text-xs uppercase tracking-[.12em]">{text(c('Constraint', 'قيد'), lang)}</p>{text(domain.constraint, lang)}</aside>}</div><Pager previous={gameDomains[index - 1]} next={gameDomains[index + 1]} base="domains" lang={lang} /></DetailLayout>;
}

export function TiersPage({ lang }: { lang: FrameworkLang }) {
  return <DetailLayout lang={lang}><Breadcrumbs section={c('Domains and Indicators', 'المجالات والمؤشرات')} current={c('Indicator tiers', 'مستويات المؤشرات')} lang={lang} /><Link href="/games#domains-indicators" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0b6a79]"><Arrow direction="back" />{text(c('Back to Domains and Indicators', 'العودة إلى المجالات والمؤشرات'), lang)}</Link><FrameworkHeader eyebrow={c('Domains and indicators', 'المجالات والمؤشرات')} title={c('Three tiers of evidential strength.', 'ثلاثة مستويات من القوة الإثباتية.')} intro={c('The tiers are cumulative — each includes the sources of the tier below and adds one class of evidence.', 'المستويات تراكمية — يضم كل مستوى مصادر المستوى الذي يسبقه ويضيف فئة واحدة من الأدلة.')} lang={lang} /><div className="mt-8 overflow-x-auto rounded-2xl border border-[#dfd2bd] bg-[#fcf8f0]"><table className="w-full min-w-[760px] border-collapse text-start text-sm"><caption className="sr-only">{text(c('Indicator tier comparison', 'مقارنة مستويات المؤشرات'), lang)}</caption><thead><tr className="border-b border-[#dfd2bd] text-[#174b44]"><th className="p-4 text-start">{text(c(' ', ' '), lang)}</th>{tiers.map((tier, index) => <th key={tier.name.en} className="p-4 text-start font-display text-lg">{text(tier.name, lang)}<span className="mt-1 block text-xs font-sans font-bold text-[#688079]">Tier {index + 1}</span></th>)}</tr></thead><tbody>{[['Sources', 'sources'], ['Indicator class', 'indicator'], ['Appropriate for', 'appropriate'], ['Not appropriate for', 'notAppropriate']].map(([label, key]) => <tr key={key} className="border-b border-[#efe4cf] last:border-0"><th className="w-40 p-4 text-start align-top font-bold text-[#688079]">{text(c(label, label === 'Sources' ? 'المصادر' : label === 'Indicator class' ? 'فئة المؤشر' : label === 'Appropriate for' ? 'مناسب لـ' : 'غير مناسب لـ'), lang)}</th>{tiers.map((tier) => <td key={tier.name.en} className="p-4 align-top leading-relaxed text-[#557068]">{text(tier[key as keyof Tier] as Copy, lang)}</td>)}</tr>)}</tbody></table></div><div className="mt-8 grid gap-5">{tiers.map((tier, index) => <section key={tier.name.en} className={`rounded-2xl border p-6 sm:p-7 ${index === 0 ? 'border-[#c7ded1] bg-[#e6f1eb]' : index === 1 ? 'border-[#a9c7d8] bg-[#e7f8fb]' : 'border-[#d8c37b] bg-[#fff3cc]'}`}><p className="text-xs font-bold uppercase tracking-[.14em] text-[#688079]">Tier {index + 1}</p><h2 className="mt-2 font-display text-2xl font-bold text-[#174b44]">{text(tier.name, lang)}</h2><p className="mt-4 text-base leading-[1.8] text-[#557068]">{text(tier.supporting, lang)}</p></section>)}</div><aside className="mt-6 rounded-2xl border-s-4 border-[#c27a12] bg-[#fff3cc] p-6 text-base font-bold leading-relaxed text-[#557068]"><p className="mb-2 text-xs uppercase tracking-[.14em] text-[#79621d]">{text(c('Operating rule', 'قاعدة التشغيل'), lang)}</p>{text(operatingRule, lang)}</aside><section className="mt-14"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#16a7bc]">{text(c('Combining sources', 'جمع المصادر'), lang)}</p><h2 className="mt-2 font-display text-3xl font-bold text-[#174b44]">{text(c('Three merge operations', 'ثلاث عمليات للدمج'), lang)}</h2><p className="mt-3 text-[#557068]">{text(c('Every multi-source indicator we produce is an instance of one of these three.', 'كل مؤشر متعدد المصادر ننتجه هو مثال على واحدة من هذه العمليات الثلاث.'), lang)}</p><div className="mt-6 grid gap-4 md:grid-cols-3">{mergeOperations.map((operation) => <article key={operation.name.en} className="rounded-2xl border border-[#dfd2bd] bg-[#fcf8f0] p-6 shadow-soft"><operation.icon className="h-7 w-7 text-[#0b6a79]" /><h3 className="mt-4 font-display text-xl font-bold text-[#174b44]">{text(operation.name, lang)}</h3><p className="mt-3 text-sm leading-relaxed text-[#557068]">{text(operation.definition, lang)}</p><p className="mt-4 border-t border-[#efe4cf] pt-4 text-xs font-bold leading-relaxed text-[#688079]">{text(operation.example, lang)}</p></article>)}</div><p className="mt-6 rounded-2xl bg-[#e6f1eb] p-5 text-sm font-semibold leading-relaxed text-[#557068]">{text(mergeClose, lang)}</p></section></DetailLayout>;
}

export function LegacyRequestGamePage({ lang }: { lang: FrameworkLang }) {
  return <DetailLayout lang={lang}><Breadcrumbs section={c('Games', 'الألعاب')} current={c('Request a game', 'اطلب لعبة')} lang={lang} /><Link href="/games" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0b6a79]"><Arrow direction="back" />{text(c('Back to Games', 'العودة إلى الألعاب'), lang)}</Link><div className="mt-8 rounded-[28px] border border-[#dfd2bd] bg-[#fcf8f0] p-7 shadow-soft sm:p-10"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{text(c('Games', 'الألعاب'), lang)}</p><h1 className="mt-3 font-display text-4xl font-black text-[#174b44]">{text(c('Request Game Development', 'طلب تطوير لعبة'), lang)}</h1><p className="mt-4 max-w-2xl text-base leading-relaxed text-[#557068]">{text(c('Submit a request and it enters review. You will be notified at each stage. Fields marked required must be completed before the request can be submitted.', 'أرسل طلباً وسيدخل مرحلة المراجعة. سيتم إعلامك في كل مرحلة. يجب إكمال الحقول المطلوبة قبل إرسال الطلب.'), lang)}</p><div className="mt-8 rounded-2xl border border-dashed border-[#a9c7d8] bg-[#e7f8fb] p-6"><p className="font-display text-xl font-bold text-[#174b44]">{text(c('The request workflow is being prepared.', 'يجري إعداد سير عمل الطلبات.'), lang)}</p><p className="mt-2 text-sm leading-relaxed text-[#557068]">{text(c('Explore the framework first, then return here when the request form is available.', 'استكشف الإطار أولاً، ثم عد إلى هنا عندما يتوفر نموذج الطلب.'), lang)}</p><Link href="/games" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2140a8] px-5 py-3 font-bold text-white">{text(c('Explore the framework', 'استكشف الإطار'), lang)} <Arrow /></Link></div></div></DetailLayout>;
}
type GameRequestDraft = {
  fullName: string;
  email: string;
  entity: string;
  phone: string;
  gameName: string;
  description: string;
  category: string[];
  ageGroup: string[];
  languages: string[];
  referenceUrl: string;
  domain: string;
  indicator: string;
  indicatorType: string;
  tier: string;
  scope: string;
  deliveryDate: string;
  notes: string;
};

const emptyRequest: GameRequestDraft = {
  fullName: '', email: '', entity: '', phone: '', gameName: '', description: '',
  category: [], ageGroup: [], languages: [],
  referenceUrl: '', domain: '', indicator: '', indicatorType: '', tier: '',
  scope: '', deliveryDate: '', notes: '',
};

const fieldClass = 'mt-2 w-full rounded-2xl border border-[#c7ded1] bg-white px-4 py-3 text-[#174b44] outline-none transition placeholder:text-[#9aaba0] focus:border-[#16a7bc] focus:ring-4 focus:ring-[#16a7bc]/15';

function RequestSection({ number, title, children, lang }: { number: number; title: Copy; children: ReactNode; lang: FrameworkLang }) {
  return <section className="rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-5 shadow-soft sm:p-7">
    <div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2140a8] font-display text-sm font-black text-white">{number}</span><h2 className="font-display text-2xl font-bold text-[#174b44]">{text(title, lang)}</h2></div>
    <div className="mt-6">{children}</div>
  </section>;
}

function LegacyRequestGamePageForm({ lang }: { lang: FrameworkLang }) {
  const [form, setForm] = useState<GameRequestDraft>(() => {
    try {
      const saved = localStorage.getItem('bunayn-game-request-draft');
      if (!saved) return emptyRequest;
      const parsed = JSON.parse(saved);
      return {
        ...emptyRequest,
        ...parsed,
        category: Array.isArray(parsed.category) ? parsed.category : parsed.category ? [parsed.category] : [],
        ageGroup: Array.isArray(parsed.ageGroup) ? parsed.ageGroup : parsed.ageGroup ? [parsed.ageGroup] : [],
      };
    } catch { return emptyRequest; }
  });
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const selectedCategories = gameCategories.filter((item) => form.category.includes(item.slug));
  const selectedDomain = gameDomains.find((item) => item.slug === form.domain);
  const selectedTier = tiers[Number(form.tier) - 1];
  const setValue = <K extends keyof GameRequestDraft>(key: K, value: GameRequestDraft[K]) => setForm((current) => ({ ...current, [key]: value }));
  const toggleList = (key: 'languages' | 'category' | 'ageGroup', value: string) => {
    setForm((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.category.length) {
      setMessage(text(c('Choose at least one game category.', 'اختر فئة لعبة واحدة على الأقل.'), lang));
      document.getElementById('request-categories')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!form.ageGroup.length) {
      setMessage(text(c('Choose at least one target age group.', 'اختر فئة عمرية مستهدفة واحدة على الأقل.'), lang));
      document.getElementById('request-age-groups')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!form.languages.length) {
      setMessage(text(c('Choose at least one game language.', 'اختر لغة واحدة على الأقل للعبة.'), lang));
      document.getElementById('request-languages')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setReference(`BUN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
    localStorage.removeItem('bunayn-game-request-draft');
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const saveDraft = () => {
    localStorage.setItem('bunayn-game-request-draft', JSON.stringify(form));
    setMessage(text(c('Draft saved on this device.', 'تم حفظ المسودة على هذا الجهاز.'), lang));
  };
  if (reference) return <DetailLayout lang={lang}><div className="rounded-[28px] border border-[#b9d6c7] bg-[#e6f1eb] p-8 text-center shadow-soft sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#33705f] text-white"><Check className="h-8 w-8" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#0b6a79]">{text(c('Request prepared', 'تم إعداد الطلب'), lang)}</p><h1 className="mt-3 font-display text-4xl font-black text-[#174b44]">{text(c('Thank you. Your game brief is ready for review.', 'شكراً لك. موجز لعبتك جاهز للمراجعة.'), lang)}</h1><p className="mt-4 text-[#557068]">{text(c('Reference number', 'الرقم المرجعي'), lang)}: <strong dir="ltr">{reference}</strong></p><div className="mx-auto mt-7 max-w-xl rounded-2xl bg-white p-5 text-start"><p className="font-display text-xl font-bold text-[#174b44]">{form.gameName}</p><p className="mt-2 text-sm text-[#557068]">{selectedCategories.map((item) => text(item.name, lang)).join(' · ')} · {form.ageGroup.join(', ')} · {selectedDomain && text(selectedDomain.name, lang)} · {selectedTier && text(selectedTier.name, lang)}</p></div><p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#557068]">{text(c('This prototype keeps the completed brief in this browser. Workflow submission, email notifications, and tracking will be connected in the request workflow.', 'يحتفظ هذا النموذج الأولي بالموجز المكتمل في هذا المتصفح. سيتم ربط الإرسال والإشعارات عبر البريد الإلكتروني والتتبع ضمن سير عمل الطلبات.'), lang)}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/games" className="rounded-full border border-[#33705f] px-5 py-3 font-bold text-[#174b44]">{text(c('Back to framework', 'العودة إلى الإطار'), lang)}</Link><button type="button" onClick={() => { setReference(''); setForm(emptyRequest); }} className="rounded-full bg-[#2140a8] px-5 py-3 font-bold text-white">{text(c('Start another request', 'ابدأ طلباً آخر'), lang)}</button></div></div></DetailLayout>;

  const individualIndicator = /child|student|individual|طفل|طالب|فرد/i.test(form.indicator);
  return <DetailLayout lang={lang}>
    <Breadcrumbs section={c('Games', 'الألعاب')} current={c('Request a game', 'اطلب لعبة')} lang={lang} />
    <Link href="/games" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0b6a79]"><Arrow direction="back" />{text(c('Back to Games', 'العودة إلى الألعاب'), lang)}</Link>
    <header className="mt-8 rounded-[28px] bg-[#174b44] p-7 text-[#fff4df] shadow-float sm:p-10"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#f2c95c]">{text(c('Build with Bunayn', 'ابنِ مع بنيان'), lang)}</p><h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">{text(c('Request Game Development', 'طلب تطوير لعبة'), lang)}</h1><p className="mt-4 max-w-3xl leading-relaxed text-[#d4e7df]">{text(c('Tell us what the game should do, who it is for, and what evidence it must produce. Required fields are marked with an asterisk.', 'أخبرنا بما يجب أن تفعله اللعبة، ولمن تُصمم، وما الأدلة التي يجب أن تنتجها. الحقول المطلوبة مميزة بنجمة.'), lang)}</p></header>
    <form onSubmit={submit} className="mt-7 space-y-5">
      <RequestSection number={1} title={c('About you', 'معلومات عنك')} lang={lang}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="font-bold text-[#174b44]">{text(c('Full name *', 'الاسم الكامل *'), lang)}<input required value={form.fullName} onChange={(event) => setValue('fullName', event.target.value)} className={fieldClass} /></label>
          <label className="font-bold text-[#174b44]">{text(c('Email *', 'البريد الإلكتروني *'), lang)}<input required type="email" value={form.email} onChange={(event) => setValue('email', event.target.value)} className={fieldClass} /></label>
          <label className="font-bold text-[#174b44]">{text(c('Entity / department *', 'الجهة / الإدارة *'), lang)}<input required value={form.entity} onChange={(event) => setValue('entity', event.target.value)} className={fieldClass} /></label>
          <label className="font-bold text-[#174b44]">{text(c('Phone', 'الهاتف'), lang)}<input type="tel" value={form.phone} onChange={(event) => setValue('phone', event.target.value)} className={fieldClass} /></label>
        </div>
      </RequestSection>
      <RequestSection number={2} title={c('The game', 'اللعبة')} lang={lang}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="font-bold text-[#174b44] sm:col-span-2">{text(c('Game name *', 'اسم اللعبة *'), lang)}<input required maxLength={120} value={form.gameName} onChange={(event) => setValue('gameName', event.target.value)} className={fieldClass} /></label>
          <label className="font-bold text-[#174b44] sm:col-span-2">{text(c('Game description *', 'وصف اللعبة *'), lang)}<textarea required minLength={100} maxLength={2000} rows={6} value={form.description} onChange={(event) => setValue('description', event.target.value)} placeholder={text(c('What happens in the game, who plays it, and what a session looks like from start to finish.', 'ما الذي يحدث في اللعبة، ومن يلعبها، وكيف تبدو الجلسة من البداية إلى النهاية.'), lang)} className={fieldClass} /><span className="mt-1 block text-end text-xs font-semibold text-[#688079]">{form.description.length} / 2000</span></label>
          <fieldset id="request-categories" className="sm:col-span-2"><legend className="font-bold text-[#174b44]">{text(c('Game categories *', 'فئات اللعبة *'), lang)}</legend><p className="mt-1 text-sm font-normal text-[#688079]">{text(c('Select every category that meaningfully shapes the game.', 'اختر كل فئة تشكل اللعبة بشكل جوهري.'), lang)}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{gameCategories.map((item) => <label key={item.slug} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 font-semibold ${form.category.includes(item.slug) ? 'border-[#2140a8] bg-[#e7f8fb] text-[#2140a8]' : 'border-[#d6e2e9] bg-white text-[#557068]'}`}><input type="checkbox" className="mt-1" checked={form.category.includes(item.slug)} onChange={() => toggleList('category', item.slug)} /><span><span className="block">{text(item.name, lang)}</span><span className="mt-1 block text-xs font-normal leading-relaxed text-[#688079]">{text(item.test, lang)} · <Link href={`/games/categories/${item.slug}`} className="font-bold text-[#0b6a79]">{text(c('View category', 'عرض الفئة'), lang)}</Link></span></span></label>)}</div></fieldset>
          <fieldset id="request-age-groups" className="sm:col-span-2"><legend className="font-bold text-[#174b44]">{text(c('Target age groups *', 'الفئات العمرية المستهدفة *'), lang)}</legend><p className="mt-1 text-sm font-normal text-[#688079]">{text(c('Select all age groups the game is designed to support.', 'اختر كل الفئات العمرية التي صممت اللعبة لدعمها.'), lang)}</p><div className="mt-3 flex flex-wrap gap-2">{['4–6', '7–9', '10–12', '13–15', '16–18'].map((age) => <label key={age} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-bold ${form.ageGroup.includes(age) ? 'border-[#2140a8] bg-[#e7f8fb] text-[#2140a8]' : 'border-[#d6e2e9] bg-white text-[#557068]'}`}><input type="checkbox" className="sr-only" checked={form.ageGroup.includes(age)} onChange={() => toggleList('ageGroup', age)} />{age}</label>)}</div></fieldset>
          <fieldset id="request-languages"><legend className="font-bold text-[#174b44]">{text(c('Game language *', 'لغة اللعبة *'), lang)}</legend><div className="mt-3 flex gap-2">{[['ar', c('Arabic', 'العربية')], ['en', c('English', 'الإنجليزية')]].map(([value, label]) => <label key={value as string} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-bold ${form.languages.includes(value as string) ? 'border-[#33705f] bg-[#e6f1eb] text-[#174b44]' : 'border-[#d6e2e9] bg-white text-[#557068]'}`}><input type="checkbox" className="sr-only" checked={form.languages.includes(value as string)} onChange={() => toggleList('languages', value as string)} />{text(label as Copy, lang)}</label>)}</div></fieldset>
          <label className="font-bold text-[#174b44]">{text(c('Sample or reference URL', 'رابط نموذج أو مرجع'), lang)}<input type="url" value={form.referenceUrl} onChange={(event) => setValue('referenceUrl', event.target.value)} placeholder="https://" className={fieldClass} /></label>
          <label className="font-bold text-[#174b44] sm:col-span-2">{text(c('Reference file', 'ملف مرجعي'), lang)}<input type="file" accept=".pdf,.png,.jpg,.jpeg,.pptx,.mp4" className={`${fieldClass} file:me-3 file:rounded-full file:border-0 file:bg-[#e7f8fb] file:px-3 file:py-2 file:font-bold file:text-[#0b6a79]`} /><span className="mt-2 block text-xs leading-relaxed text-[#688079]">{text(c('Optional: PDF, PNG, JPG, PPTX, or MP4, up to 25 MB. The file will be attached when the submission workflow is connected.', 'اختياري: PDF أو PNG أو JPG أو PPTX أو MP4 حتى 25 ميجابايت. سيتم إرفاق الملف عند ربط سير عمل الإرسال.'), lang)}</span></label>
        </div>
      </RequestSection>
      <RequestSection number={3} title={c('What it must measure', 'ما الذي يجب أن تقيسه')} lang={lang}>
        <div className="grid gap-5">
          <label className="font-bold text-[#174b44]">{text(c('Evidence domain *', 'مجال الأدلة *'), lang)}<select required value={form.domain} onChange={(event) => setValue('domain', event.target.value)} className={fieldClass}><option value="">{text(c('Choose a domain', 'اختر مجالاً'), lang)}</option>{gameDomains.map((item) => <option key={item.slug} value={item.slug}>{text(item.name, lang)}</option>)}</select>{selectedDomain && <span className="mt-2 block text-xs leading-relaxed text-[#557068]">{text(selectedDomain.headline, lang)} · <Link href={`/games/domains/${selectedDomain.slug}`} className="font-bold text-[#0b6a79]">{text(c('View domain', 'عرض المجال'), lang)}</Link></span>}</label>
          <label className="font-bold text-[#174b44]">{text(c('Indicator needed *', 'المؤشر المطلوب *'), lang)}<textarea required minLength={50} rows={4} value={form.indicator} onChange={(event) => setValue('indicator', event.target.value)} placeholder={text(c('What do you need to be able to say at the end? Name the indicator or describe the decision it must support.', 'ما الذي تحتاج إلى قوله في النهاية؟ اذكر المؤشر أو صف القرار الذي يجب أن يدعمه.'), lang)} className={fieldClass} /></label>
          <fieldset><legend className="font-bold text-[#174b44]">{text(c('Is this indicator existing or new? *', 'هل هذا المؤشر قائم أم جديد؟ *'), lang)}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{[['existing', c('Existing indicator in this domain', 'مؤشر قائم في هذا المجال')], ['new', c('New construct to be defined', 'بنية جديدة تحتاج إلى تعريف')]].map(([value, label]) => <label key={value as string} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#d6e2e9] bg-white p-4 font-semibold text-[#557068]"><input required type="radio" name="indicator-type" value={value as string} checked={form.indicatorType === value} onChange={(event) => setValue('indicatorType', event.target.value)} />{text(label as Copy, lang)}</label>)}</div></fieldset>
        </div>
      </RequestSection>
      <RequestSection number={4} title={c('Data collection tier', 'مستوى جمع البيانات')} lang={lang}>
        <p className="mb-4 text-sm font-semibold text-[#557068]">{text(c('Tiers are cumulative — Tier 3 includes everything in Tiers 1 and 2.', 'المستويات تراكمية — يضم المستوى الثالث كل ما في المستويين الأول والثاني.'), lang)}</p><div className="grid gap-3 lg:grid-cols-3">{tiers.map((tier, index) => <label key={tier.name.en} className={`cursor-pointer rounded-2xl border p-5 ${form.tier === String(index + 1) ? 'border-[#2140a8] bg-[#e7f8fb] ring-4 ring-[#2140a8]/10' : 'border-[#d6e2e9] bg-white'}`}><input required type="radio" name="tier" value={index + 1} checked={form.tier === String(index + 1)} onChange={(event) => setValue('tier', event.target.value)} /><span className="ms-2 font-display text-lg font-bold text-[#174b44]">{text(tier.name, lang)}</span><span className="mt-3 block text-sm leading-relaxed text-[#557068]">{text(tier.sources, lang)}</span><span className="mt-3 block text-xs font-bold text-[#688079]">{text(tier.appropriate, lang)}</span></label>)}</div>
        {form.tier === '3' && <div className="mt-4 flex gap-3 rounded-2xl border border-[#d8c37b] bg-[#fff3cc] p-4 text-sm leading-relaxed text-[#557068]"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#c27a12]" />{text(c('Tier 3 requires a data-sharing agreement covering every linked source and consent specific to data linkage. Review will confirm this is in place.', 'يتطلب المستوى الثالث اتفاقية لمشاركة البيانات تغطي كل مصدر مرتبط وموافقة خاصة بربط البيانات. ستؤكد المراجعة توفر ذلك.'), lang)}</div>}
        {form.domain === 'social-relations' && <div className="mt-4 flex gap-3 rounded-2xl border border-[#e8755f] bg-[#fff0eb] p-4 text-sm leading-relaxed text-[#a94d40]"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />{text(c('Social-relations indicators are referral rates requiring professional review, never diagnoses. Safeguarding indicators require Tier 3 and two independent sources.', 'مؤشرات العلاقات الاجتماعية هي معدلات إحالة تتطلب مراجعة مهنية وليست تشخيصات. مؤشرات الحماية تتطلب المستوى الثالث ومصدرين مستقلين.'), lang)}</div>}
        {form.tier === '1' && individualIndicator && <div className="mt-4 flex gap-3 rounded-2xl border border-[#d8c37b] bg-[#fff3cc] p-4 text-sm leading-relaxed text-[#557068]"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#c27a12]" />{text(c('Tier 1 is not appropriate for decisions about an identified child. Consider Tier 2 or 3, or confirm this is for population monitoring only.', 'المستوى الأول غير مناسب للقرارات المتعلقة بطفل محدد. فكّر في المستوى الثاني أو الثالث، أو أكد أن المؤشر لمراقبة السكان فقط.'), lang)}</div>}
      </RequestSection>
      <RequestSection number={5} title={c('Scope', 'النطاق')} lang={lang}>
        <div className="grid gap-3 sm:grid-cols-2">{[['collection', c('Data collection only', 'جمع البيانات فقط'), c('We build the game and deliver the validated event stream and calculated features. Your team performs the analysis.', 'نبني اللعبة ونسلّم تدفق الأحداث المعتمد والخصائص المحسوبة. يتولى فريقك التحليل.')], ['analysis', c('Data collection and analysis', 'جمع البيانات والتحليل'), c('We build the game, run the analytics pipeline, produce the indicator, and document its derivation and limitations.', 'نبني اللعبة ونشغل مسار التحليلات وننتج المؤشر ونوثق اشتقاقه وحدوده.')]].map(([value, title, description]) => <label key={(value as string)} className={`cursor-pointer rounded-2xl border p-5 ${form.scope === value ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#d6e2e9] bg-white'}`}><input required type="radio" name="scope" value={value as string} checked={form.scope === value} onChange={(event) => setValue('scope', event.target.value)} /><span className="ms-2 font-display text-lg font-bold text-[#174b44]">{text(title as Copy, lang)}</span><span className="mt-3 block text-sm leading-relaxed text-[#557068]">{text(description as Copy, lang)}</span></label>)}</div>
      </RequestSection>
      <RequestSection number={6} title={c('Timing', 'التوقيت')} lang={lang}>
        <div className="grid gap-5 sm:grid-cols-2"><label className="font-bold text-[#174b44]">{text(c('Target delivery date', 'تاريخ التسليم المستهدف'), lang)}<input type="date" value={form.deliveryDate} onChange={(event) => setValue('deliveryDate', event.target.value)} className={fieldClass} /></label><label className="font-bold text-[#174b44] sm:col-span-2">{text(c('Notes for the review team', 'ملاحظات لفريق المراجعة'), lang)}<textarea rows={4} value={form.notes} onChange={(event) => setValue('notes', event.target.value)} className={fieldClass} /></label></div>
      </RequestSection>
      {message && <p role="status" className="rounded-2xl border border-[#a9c7d8] bg-[#e7f8fb] p-4 font-bold text-[#174b44]">{message}</p>}
      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-[#d6e2e9] bg-white p-4 sm:flex-row sm:items-center sm:justify-end"><button type="button" onClick={saveDraft} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#33705f] px-5 py-3 font-bold text-[#174b44]"><Save className="h-4 w-4" />{text(c('Save draft', 'حفظ كمسودة'), lang)}</button><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2140a8] px-6 py-3 font-bold text-white shadow-[0_4px_0_#152c79] transition hover:-translate-y-0.5"><Send className="h-4 w-4" />{text(c('Submit game request', 'إرسال طلب اللعبة'), lang)}</button></div>
    </form>
  </DetailLayout>;
}
export function RequestGamePageForm({ lang }: { lang: FrameworkLang }) {
  const [, setLocation] = useLocation();
  const [isNew] = useRoute('/games/request/new');
  const [, draftParams] = useRoute<{ id: string }>('/games/request/edit/:id');
  const draftId = draftParams?.id ?? null;
  const [values, setValues] = useState<RequestFormValues>(requestEmpty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(Boolean(draftId));
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);
  const [message, setMessage] = useState('');
  const update = (key: keyof RequestFormValues, value: string | string[]) => setValues((current) => ({ ...current, [key]: value }));
  const blur = (field: string) => {
    const nextTouched = { ...touched, [field]: true };
    setTouched(nextTouched);
    setErrors(validateRequest(values));
  };
  useEffect(() => {
    if (!draftId) { setLoading(false); return; }
    requestJson('/api/game-requests/drafts').then((body) => {
      const draft = (body.drafts ?? []).find((item: any) => item.id === draftId);
      if (!draft) throw new Error('Draft not found.');
      setValues(valuesFromDraft(draft));
    }).catch((reason) => setMessage(reason instanceof Error ? reason.message : 'Unable to load draft.')).finally(() => setLoading(false));
  }, [draftId]);
  if (!draftId && !isNew) return <RequestDraftList lang={lang} onNew={() => setLocation('/games/request/new')} />;
  if (loading) return <DetailLayout lang={lang}><div className="mt-10 rounded-[24px] border border-[#d6e2e9] bg-white p-8 text-center font-semibold text-[#557068]">{text(c('Loading draft…', 'جارٍ تحميل المسودة…'), lang)}</div></DetailLayout>;
  if (submitted) return <DetailLayout lang={lang}><div className="mt-10 rounded-[28px] border border-[#b9d6c7] bg-[#e6f1eb] p-8 text-center shadow-soft sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#33705f] text-white"><Check className="h-8 w-8" /></span><h1 className="mt-6 font-display text-4xl font-black text-[#174b44]">{text(c('Your request was submitted.', 'تم إرسال طلبك.'), lang)}</h1><p className="mt-4 text-[#557068]">{text(c('Reference number', 'الرقم المرجعي'), lang)}: <strong dir="ltr">{submitted.reference}</strong></p><div className="mx-auto mt-7 max-w-xl rounded-2xl bg-white p-5 text-start"><p className="font-display text-xl font-bold text-[#174b44]">{submitted.game_name}</p><p className="mt-2 text-sm text-[#557068]">{text(requestDomainLabels[submitted.domain] ?? c(submitted.domain, submitted.domain), lang)} · {submitted.source_classes.map((source: string) => text(requestSourceLabels[source] ?? c(source, source), lang)).join(' · ')}</p></div><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href={`/games/request/${submitted.reference}`} className="rounded-full bg-[#2140a8] px-5 py-3 font-bold text-white">{text(c('Track this request', 'تتبع هذا الطلب'), lang)}</Link><Link href="/games/request" className="rounded-full border border-[#33705f] px-5 py-3 font-bold text-[#174b44]">{text(c('Back to drafts', 'العودة إلى المسودات'), lang)}</Link></div></div></DetailLayout>;
  const individualIndicator = /child|student|individual|طفل|طالب|فرد/i.test(values.indicator_needed);
  const fullSources = values.source_classes.length === 4;
  const tier = fullSources ? 'Tier 3 — Full multi-source' : values.source_classes.includes('student_self_report') ? 'Tier 2 — Game + student self-report' : 'Tier 1 — Game-only';
  const fieldProps = (field: keyof RequestFormValues) => ({ onBlur: () => blur(field), 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? `request-error-${field}` : undefined });
  const saveDraft = async () => {
    setSaving(true); setMessage('');
    try {
      const body = await requestMultipart(draftId ? `/api/game-requests/drafts/${draftId}` : '/api/game-requests/drafts', draftId ? 'PATCH' : 'POST', requestPayload(values), file);
      setLocation('/games/request');
      setMessage(body.draft ? text(c('Draft saved.', 'تم حفظ المسودة.'), lang) : '');
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Unable to save draft.'); } finally { setSaving(false); }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = validateRequest(values);
    setErrors(nextErrors);
    setTouched(Object.fromEntries(Object.keys(nextErrors).map((key) => [key, true])));
    if (Object.keys(nextErrors).length || fileError) {
      const first = Object.keys(nextErrors)[0];
      if (first) document.getElementById(`request-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSaving(true); setMessage('');
    try {
      const draftBody = await requestMultipart(draftId ? `/api/game-requests/drafts/${draftId}` : '/api/game-requests/drafts', draftId ? 'PATCH' : 'POST', requestPayload(values), file);
      const submittedBody = await requestJson(`/api/game-requests/drafts/${draftBody.draft.id}/submit`, { method: 'POST', body: JSON.stringify({}) });
      setSubmitted(submittedBody.request);
    } catch (reason: any) {
      setErrors(reason.fields ?? {});
      setMessage(reason instanceof Error ? reason.message : 'Unable to submit request.');
    } finally { setSaving(false); }
  };
  const categoryTest = gameCategories.find((item) => item.slug === values.category);
  const toggleArray = (key: 'secondary_tags' | 'languages' | 'source_classes', item: string) => update(key, values[key].includes(item) ? values[key].filter((value) => value !== item) : [...values[key], item]);
  const inputClass = 'mt-2 w-full rounded-2xl border border-[#c7ded1] bg-white px-4 py-3 text-[#174b44] outline-none transition placeholder:text-[#9aaba0] focus:border-[#16a7bc] focus:ring-4 focus:ring-[#16a7bc]/15';
  return <DetailLayout lang={lang}><Breadcrumbs section={c('Games', 'الألعاب')} current={c('Request a game', 'اطلب لعبة')} lang={lang} /><Link href="/games/request" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0b6a79]"><Arrow direction="back" />{text(c('Back to drafts', 'العودة إلى المسودات'), lang)}</Link>
    <header className="mt-8 rounded-[28px] bg-[#174b44] p-7 text-[#fff4df] shadow-float sm:p-10"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#f2c95c]">{text(c('Build with Bunayn', 'ابنِ مع بنيان'), lang)}</p><h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">{text(c('Request Game Development', 'طلب تطوير لعبة'), lang)}</h1><p className="mt-4 max-w-3xl leading-relaxed text-[#b7d1c5]">{text(c('Submit a request and it enters review. You will be notified at each stage. Fields marked required must be completed before the request can be submitted.', 'أرسل طلباً وسيدخل مرحلة المراجعة. سيتم إعلامك في كل مرحلة. يجب إكمال الحقول المطلوبة قبل إرسال الطلب.'), lang)}</p></header>
    <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
      <RequestSection number={1} title={c('Requester', 'مقدم الطلب')} lang={lang}><div className="grid gap-5 sm:grid-cols-2">
        {(['requester_name', 'requester_email', 'requester_entity', 'requester_phone'] as const).map((field) => <label key={field} id={`request-${field}`} className="font-bold text-[#174b44]">{text(field === 'requester_phone' ? c('Phone', 'الهاتف') : requestFieldLabels[field], lang)}{field !== 'requester_phone' && ' *'}<input type={field === 'requester_email' ? 'email' : field === 'requester_phone' ? 'tel' : 'text'} maxLength={field === 'requester_name' ? 160 : field === 'requester_entity' ? 200 : undefined} value={values[field]} onChange={(event) => update(field, event.target.value)} className={inputClass} {...fieldProps(field)} />{requestError({ field, errors: touched[field] ? errors : {} })}</label>)}
      </div></RequestSection>
      <RequestSection number={2} title={c('The game', 'اللعبة')} lang={lang}><div className="grid gap-5">
        <label id="request-game_name" className="font-bold text-[#174b44]">{text(requestFieldLabels.game_name, lang)} *<input maxLength={120} value={values.game_name} onChange={(event) => update('game_name', event.target.value)} className={inputClass} {...fieldProps('game_name')} />{requestError({ field: 'game_name', errors: touched.game_name ? errors : {} })}</label>
        <label id="request-game_description" className="font-bold text-[#174b44]">{text(requestFieldLabels.game_description, lang)} *<textarea minLength={100} maxLength={2000} rows={6} value={values.game_description} onChange={(event) => update('game_description', event.target.value)} placeholder={text(c('What happens in the game, who plays it, and what a session looks like from start to finish.', 'ماذا يحدث في اللعبة، ومن يلعبها، وكيف تبدو الجلسة من البداية إلى النهاية.'), lang)} className={inputClass} {...fieldProps('game_description')} /><span className="mt-1 block text-end text-xs font-semibold text-[#688079]">{values.game_description.length} / 2000</span>{requestError({ field: 'game_description', errors: touched.game_description ? errors : {} })}</label>
        <label id="request-category" className="font-bold text-[#174b44]">{text(requestFieldLabels.category, lang)} *<select value={values.category} onChange={(event) => update('category', event.target.value)} className={inputClass} {...fieldProps('category')}><option value="">{text(c('Choose a category', 'اختر فئة'), lang)}</option>{Object.entries(requestCategoryLabels).map(([value, label]) => <option key={value} value={value}>{text(label, lang)}</option>)}</select>{categoryTest && <span className="mt-2 block text-xs leading-relaxed text-[#557068]">{text(categoryTest.test, lang)} · <Link href={`/games/categories/${categoryTest.slug}`} className="font-bold text-[#0b6a79]">{text(c('View category', 'عرض الفئة'), lang)}</Link></span>}{requestError({ field: 'category', errors: touched.category ? errors : {} })}</label>
        <fieldset id="request-secondary_tags"><legend className="font-bold text-[#174b44]">{text(c('Secondary category tags', 'وسوم الفئات الثانوية'), lang)}</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{Object.entries(requestCategoryLabels).filter(([value]) => value !== values.category).map(([value, label]) => <label key={value} className="flex items-center gap-2 rounded-xl border border-[#d6e2e9] bg-white p-3 text-sm font-semibold text-[#557068]"><input type="checkbox" checked={values.secondary_tags.includes(value)} onChange={() => toggleArray('secondary_tags', value)} />{text(label, lang)}</label>)}</div></fieldset>
        <div className="grid gap-5 sm:grid-cols-2"><label id="request-age_group" className="font-bold text-[#174b44]">{text(requestFieldLabels.age_group, lang)} *<select value={values.age_group} onChange={(event) => update('age_group', event.target.value)} className={inputClass} {...fieldProps('age_group')}><option value="">{text(c('Choose an age group', 'اختر فئة عمرية'), lang)}</option>{[['4_6', '4–6'], ['7_9', '7–9'], ['10_12', '10–12'], ['13_15', '13–15'], ['16_18', '16–18']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{requestError({ field: 'age_group', errors: touched.age_group ? errors : {} })}</label><fieldset id="request-languages"><legend className="font-bold text-[#174b44]">{text(requestFieldLabels.languages, lang)} *</legend><div className="mt-2 flex flex-wrap gap-2">{[['ar', c('Arabic', 'العربية')], ['en', c('English', 'الإنجليزية')]].map(([value, label]) => <label key={value as string} className="flex items-center gap-2 rounded-xl border border-[#d6e2e9] bg-white px-4 py-3 font-semibold text-[#557068]"><input type="checkbox" checked={values.languages.includes(value as string)} onChange={() => toggleArray('languages', value as string)} />{text(label as Copy, lang)}</label>)}</div>{requestError({ field: 'languages', errors: touched.languages ? errors : {} })}</fieldset></div>
        <div><label id="request-sample_url" className="font-bold text-[#174b44]">{text(c('Sample or reference link', 'رابط العينة أو المرجع'), lang)}<input type="url" value={values.sample_url} onChange={(event) => update('sample_url', event.target.value)} placeholder="https://example.com" className={inputClass} {...fieldProps('sample_url')} /></label><p className="mt-2 text-xs text-[#557068]">{text(c('A link or file showing something close to what you have in mind — an existing game, a sketch, a screenshot, a deck.', 'رابط أو ملف يعرض شيئاً قريباً مما تفكر فيه — لعبة قائمة أو رسم أو لقطة شاشة أو عرض.'), lang)}</p>{requestError({ field: 'sample_url', errors: touched.sample_url ? errors : {} })}<label className="mt-4 block font-bold text-[#174b44]">{text(c('Reference file', 'ملف مرجعي'), lang)}<input type="file" accept=".pdf,.png,.jpg,.jpeg,.pptx,.mp4" onChange={(event) => { const selected = event.target.files?.[0] ?? null; if (selected && (selected.size > 25 * 1024 * 1024 || !/\.(pdf|png|jpe?g|pptx|mp4)$/i.test(selected.name))) { setFile(null); setFileError(text(c('Use a PDF, PNG, JPG, PPTX, or MP4 file no larger than 25MB.', 'استخدم ملف PDF أو PNG أو JPG أو PPTX أو MP4 لا يتجاوز 25 ميغابايت.'), lang)); } else { setFile(selected); setFileError(''); } }} className={`${inputClass} file:me-3 file:rounded-full file:border-0 file:bg-[#e7f8fb] file:px-3 file:py-2 file:font-bold`} />{file && <span className="mt-2 block text-sm text-[#557068]">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</span>}{fileError && <span className="mt-2 block text-sm font-semibold text-[#a94d40]" role="alert">{fileError}</span>}</label></div>
      </div></RequestSection>
      <RequestSection number={3} title={c('What it must measure', 'ما الذي يجب أن تقيسه')} lang={lang}><div className="grid gap-5">
        <label id="request-domain" className="font-bold text-[#174b44]">{text(requestFieldLabels.domain, lang)} *<select value={values.domain} onChange={(event) => update('domain', event.target.value)} className={inputClass} {...fieldProps('domain')}><option value="">{text(c('Choose a domain', 'اختر مجالاً'), lang)}</option>{Object.entries(requestDomainLabels).map(([value, label]) => <option key={value} value={value}>{text(label, lang)}</option>)}</select>{values.domain && <span className="mt-2 block text-xs leading-relaxed text-[#557068]">{text(c('Starter suggestion only — you can choose any category. Suggested categories:', 'اقتراح أولي فقط — يمكنك اختيار أي فئة. الفئات المقترحة:'), lang)} <strong>{requestDomainMapping[values.domain].map((value) => text(requestCategoryLabels[value], lang)).join(' · ')}</strong> · <Link href={`/games/domains/${values.domain}`} className="font-bold text-[#0b6a79]">{text(c('View domain', 'عرض المجال'), lang)}</Link></span>}{requestError({ field: 'domain', errors: touched.domain ? errors : {} })}</label>
        <label id="request-indicator_needed" className="font-bold text-[#174b44]">{text(requestFieldLabels.indicator_needed, lang)} *<textarea minLength={50} maxLength={2000} rows={5} value={values.indicator_needed} onChange={(event) => update('indicator_needed', event.target.value)} placeholder={text(c('What do you need to be able to say at the end? Name the indicator if you have one, or describe the decision it has to support.', 'ما الذي تحتاج إلى قوله في النهاية؟ اذكر المؤشر إن وجد أو صف القرار الذي يجب أن يدعمه.'), lang)} className={inputClass} {...fieldProps('indicator_needed')} /><span className="mt-1 block text-end text-xs font-semibold text-[#688079]">{values.indicator_needed.length} / 2000</span>{requestError({ field: 'indicator_needed', errors: touched.indicator_needed ? errors : {} })}</label>
        <fieldset id="request-indicator_is_new" aria-describedby={errors.indicator_is_new ? 'request-error-indicator_is_new' : undefined}><legend className="font-bold text-[#174b44]">{text(requestFieldLabels.indicator_is_new, lang)} *</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{[['existing', c('Existing indicator in this domain', 'مؤشر قائم في هذا المجال')], ['new', c('New construct to be defined', 'بنية جديدة تحتاج إلى تعريف')]].map(([value, label]) => <label key={value as string} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 font-semibold text-[#557068] ${values.indicator_is_new === value ? 'border-[#2140a8] bg-[#e7f8fb]' : 'border-[#d6e2e9] bg-white'}`}><input type="radio" name="indicator_type" value={value as string} checked={values.indicator_is_new === value} onChange={(event) => update('indicator_is_new', event.target.value)} />{text(label as Copy, lang)}</label>)}</div>{requestError({ field: 'indicator_is_new', errors: touched.indicator_is_new ? errors : {} })}</fieldset>
      </div></RequestSection>
      <RequestSection number={4} title={c('Data collection tier', 'مستوى جمع البيانات')} lang={lang}><fieldset id="request-source_classes" aria-describedby={errors.source_classes ? 'request-error-source_classes' : undefined}><legend className="font-bold text-[#174b44]">{text(c('Choose the source classes to include', 'اختر فئات المصادر التي تريد تضمينها'), lang)} *</legend><p className="mt-2 text-sm leading-relaxed text-[#557068]">{text(c('Select only what your entity can provide. Evidence coverage is shown below and unchecked classes are never added automatically.', 'حدد فقط ما تستطيع جهتك توفيره. تظهر تغطية الأدلة أدناه ولا تتم إضافة الفئات غير المحددة تلقائياً.'), lang)}</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(requestSourceLabels).map(([value, label]) => <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${values.source_classes.includes(value) ? 'border-[#2140a8] bg-[#e7f8fb] ring-2 ring-[#2140a8]/10' : 'border-[#d6e2e9] bg-white'}`}><input type="checkbox" checked={values.source_classes.includes(value)} onChange={() => toggleArray('source_classes', value)} className="mt-1" /><span><strong className="text-[#174b44]">{text(label, lang)}</strong><span className="mt-1 block text-sm text-[#557068]">{text(value === 'game_telemetry' ? c('In-game behaviour and process evidence.', 'سلوك اللعبة وأدلة العملية داخلها.') : value === 'student_self_report' ? c('Motivation, attitudes, and the child’s own account.', 'الدافعية والاتجاهات ورواية الطفل نفسه.') : value === 'proxy_report' ? c('Observation from adults around the child.', 'ملاحظة البالغين المحيطين بالطفل.') : c('Longitudinal opportunity and context records.', 'سجلات الفرص والسياق الطولية.'), lang)}</span></span></label>)}</div><p className="mt-4 rounded-2xl border border-[#a9c7d8] bg-[#e7f8fb] p-4 text-sm font-semibold text-[#557068]">{tier} · {text(c('Tiers are cumulative, but this selection stores exactly the classes you checked.', 'المستويات تراكمية، لكن هذا الاختيار يحفظ الفئات التي حددتها بالضبط.'), lang)}</p>{requestError({ field: 'source_classes', errors: touched.source_classes ? errors : {} })}</fieldset>
        {fullSources && <div className="mt-4 flex gap-3 rounded-2xl border border-[#d8c37b] bg-[#fff3cc] p-4 text-sm leading-relaxed text-[#557068]"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#c27a12]" />{text(c('Tier 3 requires a data-sharing agreement with your entity covering each source class to be linked, and consent that is specific to linkage rather than to collection alone. Review will confirm this is in place.', 'يتطلب المستوى الثالث اتفاقية لمشاركة البيانات مع جهتك تغطي كل فئة مصدر سيتم ربطها، وموافقة خاصة بالربط لا بالجمع فقط. ستؤكد المراجعة توفر ذلك.'), lang)}</div>}
        {values.domain === 'social_relations' && <div className="mt-4 flex gap-3 rounded-2xl border border-[#e8755f] bg-[#fff0eb] p-4 text-sm leading-relaxed text-[#a94d40]"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />{text(c('Indicators in this domain are reported as referral rates requiring professional review, never as diagnoses. Any indicator that could trigger a safeguarding response requires Tier 3 and convergence of at least two independent sources.', 'تُعرض مؤشرات هذا المجال كمعدلات إحالة تتطلب مراجعة مهنية وليست تشخيصات. وأي مؤشر قد يؤدي إلى استجابة حماية يتطلب المستوى الثالث وتقارب مصدرين مستقلين على الأقل.'), lang)}</div>}
        {values.source_classes.length === 1 && values.source_classes[0] === 'game_telemetry' && individualIndicator && <div className="mt-4 flex gap-3 rounded-2xl border border-[#d8c37b] bg-[#fff3cc] p-4 text-sm leading-relaxed text-[#557068]"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#c27a12]" />{text(c('Tier 1 indicators are not appropriate for decisions about an identified child. Consider Tier 2 or Tier 3, or confirm this indicator is for population monitoring only.', 'مؤشرات المستوى الأول غير مناسبة للقرارات المتعلقة بطفل محدد. فكّر في المستوى الثاني أو الثالث، أو أكد أن المؤشر لمراقبة السكان فقط.'), lang)}</div>}
      </RequestSection>
      <RequestSection number={5} title={c('Scope', 'النطاق')} lang={lang}><fieldset id="request-scope" aria-describedby={errors.scope ? 'request-error-scope' : undefined}><legend className="sr-only">{text(requestFieldLabels.scope, lang)}</legend><div className="grid gap-3 sm:grid-cols-2">{[['collection', c('Data collection only', 'جمع البيانات فقط'), c('We build the game and deliver the validated event stream and calculated features. Your team performs the analysis.', 'نبني اللعبة ونسلّم تدفق الأحداث المعتمد والخصائص المحسوبة. يتولى فريقك التحليل.')], ['analysis', c('Data collection and analysis', 'جمع البيانات والتحليل'), c('We build the game, run the analytics pipeline, produce the indicator against your specification, and deliver it with documentation of its derivation and limitations.', 'نبني اللعبة ونشغل مسار التحليلات وننتج المؤشر وفق مواصفاتك ونسلمه مع توثيق اشتقاقه وحدوده.')]].map(([value, title, description]) => <label key={value as string} className={`cursor-pointer rounded-2xl border p-5 ${values.scope === value ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#d6e2e9] bg-white'}`}><input type="radio" name="scope" value={value as string} checked={values.scope === value} onChange={(event) => update('scope', event.target.value)} /> <span className="ms-2 font-display text-lg font-bold text-[#174b44]">{text(title as Copy, lang)}</span><span className="mt-3 block text-sm leading-relaxed text-[#557068]">{text(description as Copy, lang)}</span></label>)}</div>{requestError({ field: 'scope', errors: touched.scope ? errors : {} })}</fieldset></RequestSection>
      <RequestSection number={6} title={c('Timing', 'التوقيت')} lang={lang}><div className="grid gap-5 sm:grid-cols-2"><label id="request-target_date" className="font-bold text-[#174b44]">{text(c('Target delivery date', 'تاريخ التسليم المستهدف'), lang)}<input type="date" value={values.target_date} onChange={(event) => update('target_date', event.target.value)} className={inputClass} {...fieldProps('target_date')} />{requestError({ field: 'target_date', errors: touched.target_date ? errors : {} })}</label><label className="font-bold text-[#174b44] sm:col-span-2">{text(c('Notes for the review team', 'ملاحظات لفريق المراجعة'), lang)}<textarea maxLength={4000} rows={4} value={values.notes} onChange={(event) => update('notes', event.target.value)} className={inputClass} /><span className="mt-1 block text-end text-xs font-semibold text-[#688079]">{values.notes.length} / 4000</span></label></div></RequestSection>
      {message && <p role="status" className="rounded-2xl border border-[#a9c7d8] bg-[#e7f8fb] p-4 font-bold text-[#174b44]">{message}</p>}
      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-[#d6e2e9] bg-white p-4 sm:flex-row sm:items-center sm:justify-end"><button type="button" disabled={saving} onClick={saveDraft} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#33705f] px-5 py-3 font-bold text-[#174b44] disabled:opacity-50"><Save className="h-4 w-4" />{text(c('Save as draft', 'حفظ كمسودة'), lang)}</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2140a8] px-6 py-3 font-bold text-white shadow-[0_4px_0_#152c79] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"><Send className="h-4 w-4" />{saving ? text(c('Saving…', 'جارٍ الحفظ…'), lang) : text(c('Submit game request', 'إرسال طلب اللعبة'), lang)}</button></div>
    </form>
  </DetailLayout>;
}

function NotFoundFramework({ lang }: { lang: FrameworkLang }) {
  return <DetailLayout lang={lang}><div className="rounded-[28px] border border-[#dfd2bd] bg-[#fcf8f0] p-10 text-center"><h1 className="font-display text-3xl font-bold text-[#174b44]">{text(c('Framework page not found', 'صفحة الإطار غير موجودة'), lang)}</h1><Link href="/games" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2140a8] px-5 py-3 font-bold text-white">{text(c('Back to Games', 'العودة إلى الألعاب'), lang)} <Arrow /></Link></div></DetailLayout>;
}

const requestFieldLabels: Record<string, Copy> = {
  requester_name: c('Full name', 'الاسم الكامل'), requester_email: c('Email', 'البريد الإلكتروني'),
  requester_entity: c('Entity / department', 'الجهة / القسم'), game_name: c('Game name', 'اسم اللعبة'),
  game_description: c('Game description', 'وصف اللعبة'), category: c('Game category', 'فئة اللعبة'),
  age_group: c('Target age group', 'الفئة العمرية المستهدفة'), languages: c('Language', 'اللغة'),
  domain: c('Domain', 'المجال'), indicator_needed: c('Indicator needed', 'المؤشر المطلوب'),
  indicator_is_new: c('Indicator type', 'نوع المؤشر'), source_classes: c('Data sources', 'مصادر البيانات'),
  scope: c('Scope', 'النطاق'),
};

const requestEmpty: RequestFormValues = {
  requester_name: '', requester_email: '', requester_entity: '', requester_phone: '',
  game_name: '', game_description: '', category: '', secondary_tags: [], age_group: '',
  languages: [], sample_url: '', domain: '', indicator_needed: '', indicator_is_new: '',
  source_classes: [], scope: '', target_date: '', notes: '',
};

async function requestJson(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('x-game-request-access', requestAccessHandle());
  if (options.body && !(options.body instanceof FormData) && !headers.has('content-type')) headers.set('content-type', 'application/json');
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || 'Request failed.'), { fields: body.fields as Record<string, string> | undefined, status: response.status });
  return body;
}

const requestCategoryLabels: Record<string, Copy> = {
  role_based: c('Role-based', 'قائمة على الأدوار'), scenario_based: c('Scenario-based', 'قائمة على السيناريو'),
  simulation_strategy: c('Simulation / Strategy', 'المحاكاة / الاستراتيجية'), puzzle: c('Puzzle', 'الألغاز'),
  mini_games: c('Mini games', 'الألعاب المصغرة'), creative: c('Creative', 'إبداعية'), exploration: c('Exploration', 'الاستكشاف'),
};

function requestError({ field, errors }: { field: string; errors: Record<string, string> }) {
  if (!errors[field]) return null;
  return <p id={`request-error-${field}`} className="mt-1 text-sm font-semibold text-[#a94d40]" role="alert">{errors[field]}</p>;
}

function RequestDraftList({ lang, onNew }: { lang: FrameworkLang; onNew: () => void }) {
  const [, setLocation] = useLocation();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    requestJson('/api/game-requests/drafts').then((body) => setDrafts(body.drafts ?? [])).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load drafts.')).finally(() => setLoading(false));
  }, []);
  return <DetailLayout lang={lang}>
    <Breadcrumbs section={c('Games', 'الألعاب')} current={c('Request a game', 'اطلب لعبة')} lang={lang} />
    <div className="mt-8 rounded-[28px] bg-[#174b44] p-7 text-[#fff4df] shadow-float sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#f2c95c]">{text(c('Build with Bunayn', 'ابنِ مع بنيان'), lang)}</p>
      <h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">{text(c('Request Game Development', 'طلب تطوير لعبة'), lang)}</h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-[#b7d1c5]">{text(c('Submit a request and it enters review. You will be notified at each stage. Fields marked required must be completed before the request can be submitted.', 'أرسل طلباً وسيدخل مرحلة المراجعة. سيتم إعلامك في كل مرحلة. يجب إكمال الحقول المطلوبة قبل إرسال الطلب.'), lang)}</p>
    </div>
    <section className="mt-8 rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-display text-2xl font-bold text-[#174b44]">{text(c('Your drafts', 'مسوداتك'), lang)}</h2><p className="mt-1 text-sm text-[#557068]">{text(c('Drafts are private to this browser and can be edited until submitted.', 'المسودات خاصة بهذا المتصفح ويمكن تعديلها حتى إرسالها.'), lang)}</p></div><button type="button" onClick={onNew} className="inline-flex items-center gap-2 rounded-full bg-[#2140a8] px-5 py-3 font-bold text-white"><Sparkles className="h-4 w-4" />{text(c('Start a new request', 'ابدأ طلباً جديداً'), lang)}</button></div>
      {loading && <p className="mt-6 text-sm font-semibold text-[#557068]">{text(c('Loading drafts…', 'جارٍ تحميل المسودات…'), lang)}</p>}
      {error && <p className="mt-6 rounded-2xl bg-[#fff0eb] p-4 font-semibold text-[#a94d40]" role="alert">{error}</p>}
      {!loading && !error && drafts.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-[#a9c7d8] bg-[#e7f8fb] p-6 text-sm leading-relaxed text-[#557068]">{text(c('No drafts yet. Start a request and save your progress at any time.', 'لا توجد مسودات بعد. ابدأ طلباً واحفظ تقدمك في أي وقت.'), lang)}</div>}
      <div className="mt-6 grid gap-3">{drafts.map((draft) => <article key={draft.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d6e2e9] bg-white p-5"><div><h3 className="font-display text-lg font-bold text-[#174b44]">{draft.game_name || text(c('Untitled game', 'لعبة بلا عنوان'), lang)}</h3><p className="mt-1 text-sm text-[#688079]">{text(c('Last updated', 'آخر تحديث'), lang)} · {new Date(draft.updated_at).toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-GB')}</p></div><button type="button" onClick={() => setLocation(`/games/request/edit/${draft.id}`)} className="rounded-full border border-[#33705f] px-4 py-2 font-bold text-[#174b44]">{text(c('Edit draft', 'تعديل المسودة'), lang)}</button></article>)}</div>
    </section>
  </DetailLayout>;
}

function validateRequest(values: RequestFormValues) {
  const errors: Record<string, string> = {};
  const required: Array<[keyof RequestFormValues, number, number]> = [
    ['requester_name', 1, 160], ['requester_email', 1, 254], ['requester_entity', 1, 200],
    ['game_name', 1, 120], ['game_description', 100, 2000], ['indicator_needed', 50, 2000],
  ];
  required.forEach(([key, min, max]) => {
    if (values[key].toString().trim().length < min || values[key].toString().trim().length > max) errors[key] = `${text(requestFieldLabels[key], 'en')} must be between ${min} and ${max} characters.`;
  });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.requester_email)) errors.requester_email = 'Enter a valid email address.';
  if (values.category === '') errors.category = 'Choose a game category.';
  if (values.age_group === '') errors.age_group = 'Choose an age group.';
  if (!values.languages.length) errors.languages = 'Choose at least one language.';
  if (values.domain === '') errors.domain = 'Choose a domain.';
  if (!values.indicator_is_new) errors.indicator_is_new = 'Choose an indicator type.';
  if (!values.source_classes.length) errors.source_classes = 'Choose at least one source class.';
  if (!values.scope) errors.scope = 'Choose a scope.';
  if (values.sample_url && !/^https?:\/\/[^\s]+$/i.test(values.sample_url)) errors.sample_url = 'Enter a valid http or https URL.';
  if (values.target_date && !/^\d{4}-\d{2}-\d{2}$/.test(values.target_date)) errors.target_date = 'Enter a valid date.';
  return errors;
}

type RequestFormValues = {
  requester_name: string;
  requester_email: string;
  requester_entity: string;
  requester_phone: string;
  game_name: string;
  game_description: string;
  category: string;
  secondary_tags: string[];
  age_group: string;
  languages: string[];
  sample_url: string;
  domain: string;
  indicator_needed: string;
  indicator_is_new: string;
  source_classes: string[];
  scope: string;
  target_date: string;
  notes: string;
};

function valuesFromDraft(draft: Record<string, any>): RequestFormValues {
  return {
    requester_name: draft.requester_name ?? '', requester_email: draft.requester_email ?? '', requester_entity: draft.requester_entity ?? '',
    requester_phone: draft.requester_phone ?? '', game_name: draft.game_name ?? '', game_description: draft.game_description ?? '',
    category: draft.category ?? '', secondary_tags: Array.isArray(draft.secondary_tags) ? draft.secondary_tags : [],
    age_group: draft.age_group ?? '', languages: Array.isArray(draft.languages) ? draft.languages : [],
    sample_url: draft.sample_url ?? '', domain: draft.domain ?? '', indicator_needed: draft.indicator_needed ?? '',
    indicator_is_new: draft.indicator_is_new ? 'new' : draft.indicator_is_new === false ? 'existing' : '',
    source_classes: Array.isArray(draft.source_classes) ? draft.source_classes : [], scope: draft.scope === 'collection_and_analysis' ? 'analysis' : draft.scope === 'collection_only' ? 'collection' : '',
    target_date: draft.target_date ?? '', notes: draft.notes ?? '',
  };
}

function requestAccessHandle() {
  const storage = (() => {
    try { return sessionStorage.getItem('bunayn-guest-mode') === 'true' ? sessionStorage : localStorage; } catch { return null; }
  })();
  if (!storage) return 'bunayn-browser-access-fallback';
  let handle = storage.getItem('bunayn-game-request-access');
  if (!handle) {
    handle = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    storage.setItem('bunayn-game-request-access', handle);
  }
  return handle;
}

const requestDomainLabels: Record<string, Copy> = {
  literacy: c('Literacy', 'القراءة والكتابة'), activities: c('Activities', 'الأنشطة'),
  environment: c('Environment', 'البيئة'), developmental_skills: c('Developmental skills', 'المهارات النمائية'),
  social_relations: c('Social relations', 'العلاقات الاجتماعية'),
};

export function GameRequestTrackingPage({ lang }: { lang: FrameworkLang }) {
  const [, params] = useRoute<{ reference: string }>('/games/request/:reference');
  const [request, setRequest] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!params?.reference) return;
    requestJson(`/api/game-requests/${encodeURIComponent(params.reference)}`).then((body) => setRequest(body.request)).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load this request.'));
  }, [params?.reference]);
  if (error) return <DetailLayout lang={lang}><div className="mt-10 rounded-[24px] bg-[#fff0eb] p-8 text-center font-semibold text-[#a94d40]" role="alert">{error}</div></DetailLayout>;
  if (!request) return <DetailLayout lang={lang}><div className="mt-10 rounded-[24px] border border-[#d6e2e9] bg-white p-8 text-center font-semibold text-[#557068]">{text(c('Loading secure request…', 'جارٍ تحميل الطلب الآمن…'), lang)}</div></DetailLayout>;
  return <DetailLayout lang={lang}><Breadcrumbs section={c('Games', 'الألعاب')} current={c('Request tracking', 'تتبع الطلب')} lang={lang} /><Link href="/games/request" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0b6a79]"><Arrow direction="back" />{text(c('Back to drafts', 'العودة إلى المسودات'), lang)}</Link>
    <header className="mt-8 rounded-[28px] bg-[#174b44] p-7 text-[#fff4df] shadow-float sm:p-10"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#f2c95c]">{text(c('Private request tracking', 'تتبع الطلب الخاص'), lang)}</p><h1 className="mt-3 font-display text-4xl font-black">{text(c('Request status', 'حالة الطلب'), lang)}</h1><p className="mt-4 text-[#b7d1c5]"><span dir="ltr">{request.reference}</span> · <strong>{request.status.replace('_', ' ')}</strong></p></header>
    <section className="mt-8 rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-6 shadow-soft sm:p-8"><h2 className="font-display text-2xl font-bold text-[#174b44]">{request.game_name}</h2><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="font-bold text-[#688079]">{text(c('Domain', 'المجال'), lang)}</dt><dd className="mt-1 font-semibold text-[#174b44]">{text(requestDomainLabels[request.domain] ?? c(request.domain, request.domain), lang)}</dd></div><div><dt className="font-bold text-[#688079]">{text(c('Evidence coverage', 'تغطية الأدلة'), lang)}</dt><dd className="mt-1 font-semibold text-[#174b44]">{(request.source_classes ?? []).map((source: string) => text(requestSourceLabels[source] ?? c(source, source), lang)).join(' · ')}</dd></div></dl>{request.sample_file && <button type="button" onClick={async () => { const response = await fetch(`/api/game-requests/${encodeURIComponent(request.reference)}/sample`, { headers: { 'x-game-request-access': requestAccessHandle() } }); if (!response.ok) return; const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement('a'); anchor.href = url; anchor.download = request.sample_file.name || 'sample'; anchor.click(); URL.revokeObjectURL(url); }} className="mt-5 inline-flex font-bold text-[#0b6a79]">{text(c('Download sample reference', 'تنزيل العينة المرجعية'), lang)}</button>}</section>
    <section className="mt-8 rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-6 shadow-soft sm:p-8"><h2 className="font-display text-2xl font-bold text-[#174b44]">{text(c('Event timeline', 'الخط الزمني للأحداث'), lang)}</h2><ol className="mt-6 space-y-5">{(request.events ?? []).map((event: any, index: number) => <li key={event.id} className="relative flex gap-4"><span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e7f8fb] font-bold text-[#0b6a79]">{index + 1}</span><div><p className="font-bold capitalize text-[#174b44]">{event.to_status.replace('_', ' ')}</p><p className="mt-1 text-sm text-[#688079]">{new Date(event.created_at).toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-GB')}</p>{event.comment && <p className="mt-2 text-sm leading-relaxed text-[#557068]">{event.comment}</p>}</div></li>)}</ol></section>
  </DetailLayout>;
}

const requestDomainMapping: Record<string, string[]> = {
  literacy: ['puzzle', 'mini_games'], activities: ['scenario_based', 'exploration', 'simulation_strategy'],
  environment: ['simulation_strategy', 'scenario_based', 'mini_games'], developmental_skills: ['puzzle', 'simulation_strategy', 'creative'],
  social_relations: ['role_based', 'scenario_based'],
};

async function requestMultipart(url: string, method: 'POST' | 'PATCH', payload: Record<string, unknown>, file: File | null) {
  const body = new FormData();
  body.append('payload', JSON.stringify(payload));
  if (file) body.append('sample_file', file, file.name);
  return requestJson(url, { method, body, headers: { 'x-game-request-access': requestAccessHandle() } });
}

function requestPayload(values: RequestFormValues) {
  return {
    ...values,
    indicator_is_new: values.indicator_is_new === 'new',
    tier: values.source_classes.length === 4 ? 'tier_3' : values.source_classes.includes('student_self_report') ? 'tier_2' : 'tier_1',
    scope: values.scope === 'analysis' ? 'collection_and_analysis' : values.scope === 'collection' ? 'collection_only' : '',
  };
}

const requestSourceLabels: Record<string, Copy> = {
  game_telemetry: c('Game telemetry', 'بيانات اللعبة التشغيلية'), student_self_report: c('Student self-report', 'التقرير الذاتي للطالب'),
  proxy_report: c('Proxy report', 'تقرير الوكيل'), administrative_data: c('Administrative data', 'البيانات الإدارية'),
};
