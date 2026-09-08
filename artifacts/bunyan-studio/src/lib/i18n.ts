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
        gameName: "Game name",
        domain: "Domain",
        domainSelect: "Select domain",
        desc: "What happens in the game",
        descHelper: "Two or three sentences describing the game",
        ageGroup: "Age group",
        ageOptions: { "6-8": "6 to 8", "9-12": "9 to 12", "13-17": "13 to 17" },
        language: "Language",
        langOptions: { "both": "Arabic and English", "ar": "Arabic only", "en": "English only" },
        behaviours: "Behaviours this game must give evidence of",
        buildWeeks: "Build time (weeks)",
        artWeeks: "Art & audio time (weeks)",
        productionNeeds: "What this game needs produced",
        submit: "Start building",
        valNameReq: "Name is required",
        valDomainReq: "Domain is required",
        valDescMin: "Description must be at least 20 characters",
        valAgeReq: "Select an age group",
        valLangReq: "Select a language",
        valBehReq: "Select at least one behaviour",
        valProdReq: "Select at least one production need"
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
        gameName: "اسم اللعبة",
        domain: "المجال",
        domainSelect: "اختر المجال",
        desc: "ماذا يحدث في اللعبة",
        descHelper: "جملتان أو ثلاث تصف اللعبة",
        ageGroup: "الفئة العمرية",
        ageOptions: { "6-8": "6 إلى 8", "9-12": "9 إلى 12", "13-17": "13 إلى 17" },
        language: "اللغة",
        langOptions: { "both": "العربية والإنجليزية", "ar": "العربية فقط", "en": "الإنجليزية فقط" },
        behaviours: "السلوكيات التي يجب أن تثبتها اللعبة",
        buildWeeks: "وقت البناء (أسابيع)",
        artWeeks: "وقت التصميم والصوت (أسابيع)",
        productionNeeds: "ما تحتاجه هذه اللعبة من إنتاج",
        submit: "ابدأ البناء",
        valNameReq: "الاسم مطلوب",
        valDomainReq: "المجال مطلوب",
        valDescMin: "الوصف يجب أن يكون 20 حرفاً على الأقل",
        valAgeReq: "اختر فئة عمرية",
        valLangReq: "اختر لغة",
        valBehReq: "اختر سلوكاً واحداً على الأقل",
        valProdReq: "اختر حاجة إنتاج واحدة على الأقل"
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
