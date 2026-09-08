export const dictionaries = {
  en: {
    nav: {
      loadSample: "Load sample game",
      save: "Save",
      export: "Export project",
      exportManifest: "Event manifest",
      savedProjects: "Saved projects",
      newProject: "New project",
      deleteProject: "Delete project",
      saving: "Saving...",
      themes: "Theme",
      run: "Run session",
      clear: "Clear grid",
      missingPiece: "Add a {piece} piece to measure this",
      missingScore: "No piece measures this"
    },
    builder: {
      palette: "Piece palette",
      inspector: "Inspector",
      emptyState: "Drag pieces here to build your game",
      conformance: {
        pass: "Runnable: {count} pieces, {events} events",
        fail: "Not runnable. Missing: {missing}",
      },
      sealed: "Sealed (Not editable. Changing theme does not change this.)",
      registryNote: "Need a value that isn't here? Request it from Bunyan."
      ,selectPiece: "Select a piece"
      ,free: "Free"
      ,bounded: "Bounded"
      ,registry: "Registry"
      ,eventConsole: "Event console"
      ,waiting: "Waiting for session..."
      ,sealedHeading: "Sealed"
    },
    landing: {
      hero: "Build behaviour-safe games.",
      sub: "A world of knowledge",
      explanation: "Bunyan Studio is the authoring tool for UAE game creators. Change the look, the subject, and the language. Never change the behavioural data contract.",
      layerTitle: "The Five-Layer Stack",
      layers: {
        theme: "Theme (Editable)",
        assets: "Assets (Editable)",
        text: "Text (Editable)",
        events: "Events (Sealed)",
        fields: "Fields (Sealed)"
      },
      start: "Open Studio"
    }
  },
  ar: {
    nav: {
      loadSample: "تحميل لعبة تجريبية",
      save: "حفظ",
      export: "تصدير المشروع",
      exportManifest: "بيان الأحداث",
      savedProjects: "المشاريع المحفوظة",
      newProject: "مشروع جديد",
      deleteProject: "حذف المشروع",
      saving: "جارٍ الحفظ...",
      themes: "السمة",
      run: "تشغيل الجلسة",
      clear: "مسح الشبكة",
      missingPiece: "أضف قطعة {piece} لقياس هذا",
      missingScore: "لا توجد قطعة تقيس هذا"
    },
    builder: {
      palette: "لوحة القطع",
      inspector: "المفتش",
      emptyState: "اسحب القطع إلى هنا لبناء لعبتك",
      conformance: {
        pass: "جاهز للتشغيل: {count} قطع، {events} أحداث",
        fail: "غير جاهز. مفقود: {missing}",
      },
      sealed: "مغلق (غير قابل للتعديل. تغيير السمة لا يغير هذا.)",
      registryNote: "تحتاج إلى قيمة غير موجودة هنا؟ اطلبها من بنيان."
      ,selectPiece: "اختر قطعة"
      ,free: "حر"
      ,bounded: "محدود"
      ,registry: "السجل"
      ,eventConsole: "وحدة الأحداث"
      ,waiting: "في انتظار الجلسة..."
      ,sealedHeading: "مختوم"
    },
    landing: {
      hero: "ابنِ ألعاباً آمنة سلوكياً.",
      sub: "عالم من المعرفة",
      explanation: "ستوديو بنيان هو أداة التأليف لصناع الألعاب في الإمارات. غيّر المظهر، الموضوع، واللغة. لا تغيّر عقد البيانات السلوكية أبداً.",
      layerTitle: "حزمة الطبقات الخمس",
      layers: {
        theme: "السمة (قابل للتعديل)",
        assets: "الأصول (قابل للتعديل)",
        text: "النصوص (قابل للتعديل)",
        events: "الأحداث (مغلق)",
        fields: "الحقول (مغلق)"
      },
      start: "افتح الاستوديو"
    }
  }
};

export function t(keyPath: string, locale: 'en' | 'ar', params?: Record<string, string>): string {
  const keys = keyPath.split('.');
  let current: any = dictionaries[locale];
  
  for (const k of keys) {
    if (current[k] === undefined) return keyPath;
    current = current[k];
  }
  
  let text = current as string;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  
  return text;
}
