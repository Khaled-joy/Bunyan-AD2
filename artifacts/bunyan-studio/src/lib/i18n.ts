export const dictionaries = {
  en: {
    nav: {
      save: "Save game",
      showBrief: "Show brief",
      hideBrief: "Hide brief",
      saving: "Saving...",
      run: "Run session",
      clear: "Clear grid",
      gameSaved: "Game saved",
      gameSaveFailed: "Failed to save game",
      exportJson: "Export JSON",
      exportManifest: "Export Manifest",
    },
    home: {
      heroTitle: "Create a game",
      heroDesc: "Bunyan Studio is the game-authoring tool for Bunyan Abu Dhabi.",
      createGame: "Create a game",
      seeGames: "See your games",
      howItWorks: "How a game gets built",
      stages: [
        { title: "1. Request arrives", desc: "Bunyan Abu Dhabi sends the topic, age group and behaviours it wants evidence of." },
        { title: "2. Write the brief", desc: "Pick the domain, describe the game, set build and art durations." },
        { title: "3. Assemble the world", desc: "Drag in a map, characters and objects; size and colour them." },
        { title: "4. Say what each action must tell you", desc: "Assign behaviours to individual pieces." },
        { title: "5. Run a session", desc: "Play it through and read the recording line by line." },
        { title: "6. Send for review", desc: "Bunyan checks the recording covers the request, then publishes." }
      ],
      decideTitle: "What you decide",
      decideDesc: "The map, the characters, the objects, size and colour of every piece, names and instructions in Arabic or English, how many / how hard / how long, and which behaviour each action must evidence.",
      sealedTitle: "What you don't",
      sealedDesc: "Every piece has a sealed list of events with fixed field names, types and units. You cannot change what a piece records.",
      incomingOrders: "Requests from Bunyan Abu Dhabi",
      openBrief: "Open brief",
      due: "Due",
      startNewGame: "Start a new game",
      form: {

        section1: "About you",
        fullName: "Full name *",
        email: "Email *",
        entity: "Entity / department *",
        phone: "Phone",
        section2: "The game",
        gameName: "Game name *",
        desc: "Game description *",
        descHelper: "What happens in the game, who plays it, and what a session looks like from start to finish.",
        categoriesTitle: "Game categories *",
        categoriesHelper: "Select every category that meaningfully shapes the game.",
        viewCategory: "View category",
        ageGroupTitle: "Target age groups *",
        ageGroupHelper: "Select all age groups the game is designed to support.",
        languageTitle: "Game language *",
        langEn: "English",
        langAr: "Arabic",
        refUrl: "Sample or reference URL",
        refFile: "Reference file",
        refFileHelper: "Optional: PDF, PNG, JPG, PPTX, or MP4, up to 25 MB. The file will be attached when the submission workflow is connected.",
        section3: "What it must measure",
        domain: "Evidence domain *",
        domainSelect: "Choose a domain",
        viewDomain: "View domain",
        indicatorNeeded: "Indicator needed *",
        indicatorHelper: "What do you need to be able to say at the end? Name the indicator or describe the decision it must support.",
        indicatorTypeTitle: "Is this indicator existing or new? *",
        indExisting: "Existing indicator in this domain",
        indNew: "New construct to be defined",
        section4: "Data collection tier",
        tierHelper: "Tiers are cumulative — Tier 3 includes everything in Tiers 1 and 2.",
        tier3Warn: "Tier 3 requires a data-sharing agreement covering every linked source and consent specific to data linkage. Review will confirm this is in place.",
        tierSocWarn: "Social-relations indicators are referral rates requiring professional review, never diagnoses. Safeguarding indicators require Tier 3 and two independent sources.",
        tier1Warn: "Tier 1 is not appropriate for decisions about an identified child. Consider Tier 2 or 3, or confirm this is for population monitoring only.",
        section5: "Scope",
        scopeCollection: "Data collection only",
        scopeCollectionDesc: "We build the game and deliver the validated event stream and calculated features. Your team performs the analysis.",
        scopeAnalysis: "Data collection and analysis",
        scopeAnalysisDesc: "We build the game, run the analytics pipeline, produce the indicator, and document its derivation and limitations.",
        section6: "Timing",
        deliveryDate: "Target delivery date",
        notes: "Notes for the review team",
        submit: "Submit game request",
        saveDraft: "Save draft",
        draftSaved: "Draft saved on this device.",
        valNameReq: "Full name is required",
        valEmailReq: "Valid email is required",
        valEntityReq: "Entity is required",
        valGameNameReq: "Game name is required",
        valDomainReq: "Domain is required",
        valDescMin: "Description must be at least 100 characters",
        valDescMax: "Description cannot exceed 2000 characters",
        valAgeReq: "Select at least one age group",
        valLangReq: "Select at least one language",
        valCatReq: "Select at least one category",
        valIndReq: "Indicator is required (min 50 characters)",
        valIndTypeReq: "Select indicator type",
        valTierReq: "Select a tier",
        valScopeReq: "Select scope"

      },
      pieces: {
        map: "Map",
        characters: "Characters",
        objects: "Objects",
        actions: "Actions"
      },
      yourGames: "Your games",
      noGames: "No saved games found.",
      piecesCount: "pieces",
      confirmDelete: "Delete this game?",
      statusDraft: "draft",
      statusBuilding: "building",
      statusReview: "in review",
      created: "Created"
    },
    builder: {
      palette: "Pieces",
      inspector: "This piece",
      emptyState: "Nothing here yet. Start with a map, then add your characters.",
      brief: "Brief",
      description: "Description",
      behavioursReq: "Required Behaviours",
      productionReq: "Production Needs",
      howItLooks: "1. How it looks",
      itsNumbers: "2. Its numbers",
      whatMustTell: "3. What this must tell you",
      whyThisShows: "Why this piece shows it",
      sealedSection: "4. Sealed",
      notEditable: "Not editable. Size, colour and name do not change this list.",
      registryNote: "Chosen from the Bunyan list",
      decorationNote: "A piece with nothing ticked is decoration.",
      inBrief: "in brief",
      unassignedBadge: "Missing behaviour assignment",
      readiness: {
        missingStructure: "Needs a map, a player child, and a goal.",
        missingSpecific: "Needs a {missing}.",
        unassigned: "{count} pieces have no behaviour assigned. Open it and tick what it must tell you.",
        uncovered: "The brief asks for {behaviour}, and no piece is covering that yet.",
        ready: "Ready: {pieces} pieces, {events} recorded event types, every behaviour in the brief covered."
      },
      bars: {
        noPiece: "No piece assigned yet. Open a piece and tick this behaviour.",
        from: "From:"
      },
      inspectorLabels: {
        name: "Name",
        size: "Size",
        colour: "Colour"
      },
      eventConsole: "Event console",
      waiting: "Waiting for session...",
      selectPiece: "Select a piece on the grid",
      selectOption: "Select...",
      rangeWarn: "Value must be between {min} and {max}",
      ages: "ages",
      buildShort: "build",
      artShort: "art",
      weeksShort: "w",
    },
    notFound: "Page not found",
    goHome: "Go home"
  },
  ar: {
    nav: {
      save: "حفظ اللعبة",
      showBrief: "عرض الملخص",
      hideBrief: "إخفاء الملخص",
      saving: "جارٍ الحفظ...",
      run: "تشغيل الجلسة",
      clear: "مسح الشبكة",
      gameSaved: "تم حفظ اللعبة",
      gameSaveFailed: "فشل حفظ اللعبة",
      exportJson: "تصدير اللعبة",
      exportManifest: "تصدير قائمة الأحداث",
    },
    home: {
      heroTitle: "ابتكر لعبة",
      heroDesc: "استوديو بنيان هو أداة إنشاء الألعاب لبنيان أبوظبي.",
      createGame: "ابتكر لعبة",
      seeGames: "رؤية ألعابك",
      howItWorks: "كيف يتم بناء اللعبة",
      stages: [
        { title: "1. وصول الطلب", desc: "ترسل بنيان أبوظبي الموضوع والفئة العمرية والسلوكيات التي تريد أدلة عليها." },
        { title: "2. كتابة الملخص", desc: "اختر المجال، صف اللعبة، وحدد فترات البناء والتصميم." },
        { title: "3. تجميع العالم", desc: "اسحب الخريطة، الشخصيات، والأشياء؛ حدد حجمها ولونها." },
        { title: "4. حدد ما تخبرك به كل حركة", desc: "قم بتعيين السلوكيات للقطع الفردية." },
        { title: "5. تشغيل جلسة", desc: "العبها واقرأ التسجيل سطراً بسطر." },
        { title: "6. إرسال للمراجعة", desc: "تتحقق بنيان من أن التسجيل يغطي الطلب، ثم تنشر." }
      ],
      decideTitle: "ما تقرره أنت",
      decideDesc: "الخريطة، الشخصيات، الأشياء، حجم ولون كل قطعة، الأسماء والتعليمات بالعربية أو الإنجليزية، الكمية / الصعوبة / المدة، وأي سلوك يجب أن تثبته كل حركة.",
      sealedTitle: "ما لا تقرره",
      sealedDesc: "كل قطعة لها قائمة مغلقة من الأحداث بأسماء حقول وأنواع ووحدات ثابتة. لا يمكنك تغيير ما تسجله القطعة.",
      incomingOrders: "طلبات من بنيان أبوظبي",
      openBrief: "فتح الملخص",
      due: "مستحق في",
      startNewGame: "ابدأ لعبة جديدة",
      form: {

        section1: "معلومات عنك",
        fullName: "الاسم الكامل *",
        email: "البريد الإلكتروني *",
        entity: "الجهة / الإدارة *",
        phone: "الهاتف",
        section2: "اللعبة",
        gameName: "اسم اللعبة *",
        desc: "وصف اللعبة *",
        descHelper: "ما الذي يحدث في اللعبة، ومن يلعبها، وكيف تبدو الجلسة من البداية إلى النهاية.",
        categoriesTitle: "فئات اللعبة *",
        categoriesHelper: "اختر كل فئة تشكل اللعبة بشكل جوهري.",
        viewCategory: "عرض الفئة",
        ageGroupTitle: "الفئات العمرية المستهدفة *",
        ageGroupHelper: "اختر كل الفئات العمرية التي صممت اللعبة لدعمها.",
        languageTitle: "لغة اللعبة *",
        langEn: "الإنجليزية",
        langAr: "العربية",
        refUrl: "رابط نموذج أو مرجع",
        refFile: "ملف مرجعي",
        refFileHelper: "اختياري: PDF أو PNG أو JPG أو PPTX أو MP4 حتى 25 ميجابايت. سيتم إرفاق الملف عند ربط سير عمل الإرسال.",
        section3: "ما الذي يجب أن تقيسه",
        domain: "مجال الأدلة *",
        domainSelect: "اختر مجالاً",
        viewDomain: "عرض المجال",
        indicatorNeeded: "المؤشر المطلوب *",
        indicatorHelper: "ما الذي تحتاج إلى قوله في النهاية؟ اذكر المؤشر أو صف القرار الذي يجب أن يدعمه.",
        indicatorTypeTitle: "هل هذا المؤشر قائم أم جديد؟ *",
        indExisting: "مؤشر قائم في هذا المجال",
        indNew: "بنية جديدة تحتاج إلى تعريف",
        section4: "مستوى جمع البيانات",
        tierHelper: "المستويات تراكمية — يضم المستوى الثالث كل ما في المستويين الأول والثاني.",
        tier3Warn: "يتطلب المستوى الثالث اتفاقية لمشاركة البيانات تغطي كل مصدر مرتبط وموافقة خاصة بربط البيانات. ستؤكد المراجعة توفر ذلك.",
        tierSocWarn: "مؤشرات العلاقات الاجتماعية هي معدلات إحالة تتطلب مراجعة مهنية وليست تشخيصات. مؤشرات الحماية تتطلب المستوى الثالث ومصدرين مستقلين.",
        tier1Warn: "المستوى الأول غير مناسب للقرارات المتعلقة بطفل محدد. فكّر في المستوى الثاني أو الثالث، أو أكد أن المؤشر لمراقبة السكان فقط.",
        section5: "النطاق",
        scopeCollection: "جمع البيانات فقط",
        scopeCollectionDesc: "نبني اللعبة ونسلّم تدفق الأحداث المعتمد والخصائص المحسوبة. يتولى فريقك التحليل.",
        scopeAnalysis: "جمع البيانات والتحليل",
        scopeAnalysisDesc: "نبني اللعبة ونشغل مسار التحليلات وننتج المؤشر ونوثق اشتقاقه وحدوده.",
        section6: "التوقيت",
        deliveryDate: "تاريخ التسليم المستهدف",
        notes: "ملاحظات لفريق المراجعة",
        submit: "إرسال طلب اللعبة",
        saveDraft: "حفظ كمسودة",
        draftSaved: "تم حفظ المسودة على هذا الجهاز.",
        valNameReq: "الاسم الكامل مطلوب",
        valEmailReq: "البريد الإلكتروني الصالح مطلوب",
        valEntityReq: "الجهة مطلوبة",
        valGameNameReq: "اسم اللعبة مطلوب",
        valDomainReq: "المجال مطلوب",
        valDescMin: "الوصف يجب أن يكون 100 حرفاً على الأقل",
        valDescMax: "الوصف يجب أن لا يتجاوز 2000 حرف",
        valAgeReq: "اختر فئة عمرية واحدة على الأقل",
        valLangReq: "اختر لغة واحدة على الأقل",
        valCatReq: "اختر فئة واحدة على الأقل",
        valIndReq: "المؤشر مطلوب (50 حرفاً على الأقل)",
        valIndTypeReq: "اختر نوع المؤشر",
        valTierReq: "اختر مستوى",
        valScopeReq: "اختر النطاق"

      },
      pieces: {
        map: "خريطة",
        characters: "شخصيات",
        objects: "أشياء",
        actions: "أفعال"
      },
      yourGames: "ألعابك",
      noGames: "لم يتم العثور على ألعاب محفوظة.",
      piecesCount: "قطع",
      confirmDelete: "حذف هذه اللعبة؟",
      statusDraft: "مسودة",
      statusBuilding: "قيد البناء",
      statusReview: "قيد المراجعة",
      created: "تاريخ الإنشاء"
    },
    builder: {
      palette: "القطع",
      inspector: "هذه القطعة",
      emptyState: "لا شيء هنا بعد. ابدأ بخريطة، ثم أضف شخصياتك.",
      brief: "الملخص",
      description: "الوصف",
      behavioursReq: "السلوكيات المطلوبة",
      productionReq: "احتياجات الإنتاج",
      howItLooks: "1. كيف تبدو",
      itsNumbers: "2. أرقامها",
      whatMustTell: "3. ما يجب أن تخبرك به",
      whyThisShows: "لماذا تظهر هذه القطعة ذلك",
      sealedSection: "4. مغلق",
      notEditable: "غير قابل للتعديل. الحجم واللون والاسم لا يغيرون هذه القائمة.",
      registryNote: "مختارة من قائمة بنيان",
      decorationNote: "القطعة التي لم يتم تحديد شيء فيها هي للزينة.",
      inBrief: "في الملخص",
      unassignedBadge: "لم يتم تعيين سلوك",
      readiness: {
        missingStructure: "تحتاج إلى خريطة، طفل لاعب، وهدف.",
        missingSpecific: "تحتاج إلى {missing}.",
        unassigned: "{count} قطع ليس لها سلوك معين. افتحها وحدد ما يجب أن تخبرك به.",
        uncovered: "يطلب الملخص {behaviour}، ولا توجد قطعة تغطي ذلك بعد.",
        ready: "جاهز: {pieces} قطع، {events} أنواع أحداث مسجلة، تم تغطية كل سلوك في الملخص."
      },
      bars: {
        noPiece: "لم يتم تعيين قطعة بعد. افتح قطعة وحدد هذا السلوك.",
        from: "من:"
      },
      inspectorLabels: {
        name: "الاسم",
        size: "الحجم",
        colour: "اللون"
      },
      eventConsole: "وحدة الأحداث",
      waiting: "في انتظار الجلسة...",
      selectPiece: "اختر قطعة من الشبكة",
      selectOption: "اختر...",
      rangeWarn: "يجب أن تكون القيمة بين {min} و {max}",
      ages: "الأعمار",
      buildShort: "البناء",
      artShort: "الفن",
      weeksShort: "أ",
    },
    notFound: "الصفحة غير موجودة",
    goHome: "العودة للرئيسية"
  }
};

export function t(keyPath: string, locale: 'en' | 'ar', params?: Record<string, string | number>): string {
  const keys = keyPath.split('.');
  let current: any = dictionaries[locale];
  
  for (const k of keys) {
    if (current?.[k] === undefined) {
      if (locale !== 'en') {
         return t(keyPath, 'en', params);
      }
      return keyPath;
    }
    current = current[k];
  }
  
  if (Array.isArray(current)) return current as any;
  
  let text = current as string;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  
  return text;
}
