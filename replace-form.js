const fs = require('fs');

const path = 'artifacts/bunyan-studio/src/pages/landing.tsx';
let code = fs.readFileSync(path, 'utf8');

const newFormJSX = `
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7">
              <RequestSection number={1} title={t('home.form.section1', locale) as string}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.fullName', locale) as string}
                    <input required {...form.register('fullName')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    {form.formState.errors.fullName && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.fullName.message}</p>}
                  </label>
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.email', locale) as string}
                    <input required type="email" {...form.register('email')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    {form.formState.errors.email && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.email.message}</p>}
                  </label>
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.entity', locale) as string}
                    <input required {...form.register('entity')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    {form.formState.errors.entity && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.entity.message}</p>}
                  </label>
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.phone', locale) as string}
                    <input type="tel" {...form.register('phone')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                  </label>
                </div>
              </RequestSection>

              <RequestSection number={2} title={t('home.form.section2', locale) as string}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="font-bold text-[var(--ink)] sm:col-span-2">
                    {t('home.form.gameName', locale) as string}
                    <input required maxLength={120} {...form.register('gameName')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    {form.formState.errors.gameName && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.gameName.message}</p>}
                  </label>
                  
                  <label className="font-bold text-[var(--ink)] sm:col-span-2">
                    {t('home.form.desc', locale) as string}
                    <textarea required minLength={100} maxLength={2000} rows={6} {...form.register('description')} placeholder={t('home.form.descHelper', locale) as string} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    <span className="mt-1 block text-end text-xs font-semibold text-[var(--ink-soft)]">{form.watch('description')?.length || 0} / 2000</span>
                    {form.formState.errors.description && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.description.message}</p>}
                  </label>

                  <fieldset className="sm:col-span-2">
                    <legend className="font-bold text-[var(--ink)]">{t('home.form.categoriesTitle', locale) as string}</legend>
                    <p className="mt-1 text-sm font-normal text-[var(--ink-soft)]">{t('home.form.categoriesHelper', locale) as string}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {NEW_CATEGORIES.map(cat => {
                        const isChecked = form.watch('categories')?.includes(cat.id);
                        return (
                          <label key={cat.id} className={\`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 font-semibold \${isChecked ? 'border-[var(--blue)] bg-[var(--blue)]/5 text-[var(--blue)]' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]'}\`}>
                            <input type="checkbox" value={cat.id} {...form.register('categories')} className="mt-1" />
                            <span>
                              <span className="block">{locale === 'ar' ? cat.labelAr : cat.label}</span>
                              <span className="mt-1 block text-xs font-normal leading-relaxed text-[var(--ink-faint)]">
                                {locale === 'ar' ? cat.testAr : cat.test}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {form.formState.errors.categories && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.categories.message}</p>}
                  </fieldset>

                  <fieldset className="sm:col-span-2">
                    <legend className="font-bold text-[var(--ink)]">{t('home.form.ageGroupTitle', locale) as string}</legend>
                    <p className="mt-1 text-sm font-normal text-[var(--ink-soft)]">{t('home.form.ageGroupHelper', locale) as string}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['4-6', '7-9', '10-12', '13-15', '16-18'].map(age => {
                        const isChecked = form.watch('ageGroups')?.includes(age);
                        return (
                          <label key={age} className={\`cursor-pointer rounded-full border px-4 py-2 text-sm font-bold \${isChecked ? 'border-[var(--blue)] bg-[var(--blue)]/5 text-[var(--blue)]' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]'}\`}>
                            <input type="checkbox" value={age} {...form.register('ageGroups')} className="sr-only" />
                            {age.replace('-', '–')}
                          </label>
                        );
                      })}
                    </div>
                    {form.formState.errors.ageGroups && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.ageGroups.message}</p>}
                  </fieldset>

                  <fieldset>
                    <legend className="font-bold text-[var(--ink)]">{t('home.form.languageTitle', locale) as string}</legend>
                    <div className="mt-3 flex gap-2">
                      {[{ id: 'ar', label: t('home.form.langAr', locale) as string }, { id: 'en', label: t('home.form.langEn', locale) as string }].map(lang => {
                        const isChecked = form.watch('languages')?.includes(lang.id);
                        return (
                          <label key={lang.id} className={\`cursor-pointer rounded-full border px-4 py-2 text-sm font-bold \${isChecked ? 'border-[var(--teal)] bg-[var(--teal)]/10 text-[var(--teal)]' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]'}\`}>
                            <input type="checkbox" value={lang.id} {...form.register('languages')} className="sr-only" />
                            {lang.label}
                          </label>
                        );
                      })}
                    </div>
                    {form.formState.errors.languages && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.languages.message}</p>}
                  </fieldset>

                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.refUrl', locale) as string}
                    <input type="url" {...form.register('referenceUrl')} placeholder="https://" className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                  </label>

                  <label className="font-bold text-[var(--ink)] sm:col-span-2">
                    {t('home.form.refFile', locale) as string}
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.pptx,.mp4" className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent file:me-3 file:rounded-full file:border-0 file:bg-[var(--blue)]/10 file:px-3 file:py-2 file:font-bold file:text-[var(--blue)]" />
                    <span className="mt-2 block text-xs leading-relaxed text-[var(--ink-soft)]">{t('home.form.refFileHelper', locale) as string}</span>
                  </label>
                </div>
              </RequestSection>

              <RequestSection number={3} title={t('home.form.section3', locale) as string}>
                <div className="grid gap-5">
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.domain', locale) as string}
                    <select required {...form.register('domain')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-[var(--surface)]">
                      <option value="">{t('home.form.domainSelect', locale) as string}</option>
                      {NEW_DOMAINS.map(d => <option key={d.id} value={d.id}>{locale === 'ar' ? d.labelAr : d.label}</option>)}
                    </select>
                    {(() => {
                      const d = form.watch('domain');
                      const domainObj = NEW_DOMAINS.find(x => x.id === d);
                      if (!domainObj) return null;
                      return (
                        <span className="mt-2 block text-xs leading-relaxed text-[var(--ink-soft)]">
                          {locale === 'ar' ? domainObj.headlineAr : domainObj.headline}
                        </span>
                      );
                    })()}
                    {form.formState.errors.domain && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.domain.message}</p>}
                  </label>

                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.indicatorNeeded', locale) as string}
                    <textarea required minLength={50} rows={4} {...form.register('indicator')} placeholder={t('home.form.indicatorHelper', locale) as string} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    {form.formState.errors.indicator && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.indicator.message}</p>}
                  </label>

                  <fieldset>
                    <legend className="font-bold text-[var(--ink)]">{t('home.form.indicatorTypeTitle', locale) as string}</legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {[{ id: 'existing', label: t('home.form.indExisting', locale) as string }, { id: 'new', label: t('home.form.indNew', locale) as string }].map(opt => (
                        <label key={opt.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 font-semibold text-[var(--ink-soft)]">
                          <input required type="radio" value={opt.id} {...form.register('indicatorType')} />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </RequestSection>

              <RequestSection number={4} title={t('home.form.section4', locale) as string}>
                <p className="mb-4 text-sm font-semibold text-[var(--ink-soft)]">{t('home.form.tierHelper', locale) as string}</p>
                <div className="grid gap-3 lg:grid-cols-3">
                  {TIERS.map(tier => {
                    const isChecked = form.watch('tier') === tier.id;
                    return (
                      <label key={tier.id} className={\`cursor-pointer rounded-2xl border p-5 \${isChecked ? 'border-[var(--blue)] bg-[var(--blue)]/5 ring-4 ring-[var(--blue)]/10' : 'border-[var(--line)] bg-[var(--surface)]'}\`}>
                        <input required type="radio" value={tier.id} {...form.register('tier')} />
                        <span className="ms-2 font-display text-lg font-bold text-[var(--ink)]">{locale === 'ar' ? tier.nameAr : tier.name}</span>
                        <span className="mt-3 block text-sm leading-relaxed text-[var(--ink-soft)]">{locale === 'ar' ? tier.sourcesAr : tier.sources}</span>
                        <span className="mt-3 block text-xs font-bold text-[var(--ink-faint)]">{locale === 'ar' ? tier.appropriateAr : tier.appropriate}</span>
                      </label>
                    );
                  })}
                </div>
                {form.formState.errors.tier && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.tier.message}</p>}

                {form.watch('tier') === '3' && (
                  <div className="mt-4 flex gap-3 rounded-2xl border border-[var(--amber)] bg-[var(--amber)]/10 p-4 text-sm leading-relaxed text-[var(--ink-soft)]">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warn)]" />
                    {t('home.form.tier3Warn', locale) as string}
                  </div>
                )}
                {form.watch('domain') === 'social-relations' && (
                  <div className="mt-4 flex gap-3 rounded-2xl border border-[var(--coral)] bg-[var(--coral)]/10 p-4 text-sm leading-relaxed text-[var(--coral)]">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    {t('home.form.tierSocWarn', locale) as string}
                  </div>
                )}
                {form.watch('tier') === '1' && form.watch('indicator') && /child|student|individual|طفل|طالب|فرد/i.test(form.watch('indicator')) && (
                  <div className="mt-4 flex gap-3 rounded-2xl border border-[var(--amber)] bg-[var(--amber)]/10 p-4 text-sm leading-relaxed text-[var(--ink-soft)]">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warn)]" />
                    {t('home.form.tier1Warn', locale) as string}
                  </div>
                )}
              </RequestSection>

              <RequestSection number={5} title={t('home.form.section5', locale) as string}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: 'collection', label: t('home.form.scopeCollection', locale) as string, desc: t('home.form.scopeCollectionDesc', locale) as string },
                    { id: 'analysis', label: t('home.form.scopeAnalysis', locale) as string, desc: t('home.form.scopeAnalysisDesc', locale) as string }
                  ].map(scope => {
                    const isChecked = form.watch('scope') === scope.id;
                    return (
                      <label key={scope.id} className={\`cursor-pointer rounded-2xl border p-5 \${isChecked ? 'border-[var(--teal)] bg-[var(--teal)]/10' : 'border-[var(--line)] bg-[var(--surface)]'}\`}>
                        <input required type="radio" value={scope.id} {...form.register('scope')} />
                        <span className="ms-2 font-display text-lg font-bold text-[var(--ink)]">{scope.label}</span>
                        <span className="mt-3 block text-sm leading-relaxed text-[var(--ink-soft)]">{scope.desc}</span>
                      </label>
                    );
                  })}
                </div>
                {form.formState.errors.scope && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.scope.message}</p>}
              </RequestSection>

              <RequestSection number={6} title={t('home.form.section6', locale) as string}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.deliveryDate', locale) as string}
                    <input type="date" {...form.register('deliveryDate')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                  </label>
                  <label className="font-bold text-[var(--ink)] sm:col-span-2">
                    {t('home.form.notes', locale) as string}
                    <textarea rows={4} {...form.register('notes')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                  </label>
                </div>
              </RequestSection>

              <div className="flex flex-col-reverse gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-end">
                <Button type="button" variant="outline" className="gap-2 rounded-full font-bold">
                  {t('home.form.saveDraft', locale) as string}
                </Button>
                <Button type="submit" className="gap-2 rounded-full bg-[var(--blue)] font-bold text-white shadow-sm transition hover:-translate-y-0.5" disabled={createProject.isPending}>
                  <Send className="h-4 w-4" />
                  {t('home.form.submit', locale) as string}
                </Button>
              </div>
            </form>
`;

// Replace from `<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">` up to `</form>`
const regex = /<form onSubmit=\{form\.handleSubmit\(onSubmit\)\} className="space-y-6">[\s\S]*?<\/form>/;
code = code.replace(regex, newFormJSX);

fs.writeFileSync(path, code);
