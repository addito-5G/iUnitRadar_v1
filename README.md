# iUnitRadar — refactored unit economics calculator

Это refactor production-сборки калькулятора unit economics для B2B SaaS.

Важно: исходный source-код проекта не был передан, были доступны только собранные статические файлы (`index.html`, CSS bundle, JS bundle) и workflow GitHub Pages. Поэтому проект ниже — это **осознанная пересборка в поддерживаемую модульную структуру на чистых ES modules**, с сохранением доменной логики и добавлением remote sharing.

## Что изменено

### 1) Архитектура
- Вычисления вынесены в `src/lib/calculations.js`.
- Валидация и нормализация вынесены в `src/lib/validators.js`.
- Форматирование вынесено в `src/lib/formatters.js`.
- Export / import вынесены в `src/lib/exporters.js`.
- Логика shared snapshot вынесена в `src/features/share/*`.
- Локальное состояние и персистентность разделены:
  - `src/state/app-store.js`
  - `src/state/local-storage.js`
- Форма редактора месяца отделена от нормализованного доменного объекта.

### 2) State model
Введён единый state shape:
- `months[]` — доменные записи по месяцам
- `appState` — thresholds, activation config, selected month
- `ui` — section, share status, shared mode, remote load state

### 3) Business logic
Сохранены и централизованы ключевые derived metrics:
- MRR / ARR / ARPA / ARPU / ACV
- Logo Churn / Revenue Churn / Contraction / Expansion
- GRR / NRR / Quick Ratio
- CAC / CAC Activated / Activation Rate
- Gross Margin / Subscription Gross Margin / Service Gross Margin
- LTV / LTV:CAC / Payback / Activated Payback / ROMI
- Revenue Growth / MRR Growth / Rule of 40
- Health score и health flags

### 4) Local draft + remote sharing
- Локальное хранение сохранено как быстрый draft layer (`localStorage`).
- Источником истины для шаринга стал **remote snapshot** в Supabase.
- Пользователь может:
  1. заполнить калькулятор,
  2. нажать **Сохранить и получить ссылку**,
  3. получить URL вида `?calc=<uuid>`,
  4. отправить его другому пользователю,
  5. а тот увидит тот же snapshot.

### 5) Edge cases
Учтены сценарии:
- не настроен Supabase;
- битый `calc` id;
- shared snapshot не найден;
- ошибка сети;
- пустой payload;
- неподдерживаемая версия shared schema;
- ошибки валидации при сохранении месяца.

## Почему выбран Supabase

Для статического GitHub Pages деплоя здесь лучше всего подходит BaaS без отдельного backend-сервера.

Плюсы выбранного варианта:
- не нужен собственный сервер;
- можно хранить snapshot как `jsonb`;
- ссылка строится просто через `?calc=<id>`;
- легко добавить schema versioning;
- подходит для публичного статического фронта с anon key.

Дополнительно: для минимизации зависимости от внешнего SDK использован **прямой REST-запрос к Supabase**, а не `@supabase/supabase-js`.

## Структура проекта

```text
.
├── .github/workflows/pages.yml
├── config.example.js
├── config.js
├── favicon.png
├── index.html
├── styles.css
├── supabase/schema.sql
└── src
    ├── app.js
    ├── types.js
    ├── state
    │   ├── app-store.js
    │   └── local-storage.js
    ├── lib
    │   ├── calculations.js
    │   ├── constants.js
    │   ├── exporters.js
    │   ├── formatters.js
    │   ├── month-model.js
    │   ├── share-payload.js
    │   ├── supabase-rest.js
    │   └── validators.js
    └── features
        ├── calculator
        │   ├── dashboard-view.js
        │   ├── field-config.js
        │   ├── glossary.js
        │   └── month-editor.js
        └── share
            ├── share-panel.js
            └── share-service.js
```

## Настройка Supabase

1. Создайте проект в Supabase.
2. Откройте SQL editor.
3. Выполните `supabase/schema.sql`.
4. Возьмите:
   - `Project URL`
   - `anon public key`
5. Заполните `config.js`:

```js
window.__APP_CONFIG__ = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
  appName: "iUnitRadar",
};
```

## Локальный запуск

Поскольку проект buildless и использует нативные ES modules, достаточно любого статического сервера.

Примеры:

### Python
```bash
python -m http.server 8080
```

### Node
```bash
npx serve .
```

После этого откройте:

```text
http://localhost:8080
```

## Деплой

Проект совместим с текущим статическим деплоем на GitHub Pages.

Workflow уже лежит в `.github/workflows/pages.yml`.
Он публикует корень репозитория как статический сайт.

## Проверка сценария шаринга

### Сценарий A → B

1. Пользователь A открывает приложение.
2. Вводит или редактирует данные.
3. Нажимает **Сохранить и получить ссылку**.
4. Приложение сохраняет snapshot в Supabase.
5. Пользователь A получает URL вида:
   - `https://your-domain.example/?calc=<uuid>`
6. Пользователь A отправляет ссылку пользователю B.
7. Пользователь B открывает ссылку на другом устройстве.
8. Приложение читает `calc` из query string.
9. Загружает snapshot из Supabase.
10. Показывает те же входные данные и те же рассчитанные метрики.

## Ограничения решения

- Shared snapshots сейчас публично доступны всем, у кого есть URL. Для публичного калькулятора это обычно нормально, но для чувствительных данных стоит добавлять auth или signed access pattern.
- Сейчас используется create-only sharing: каждый новый share создаёт новый snapshot. Это проще и надёжнее, чем update existing shared record.
- Threshold editor и activation-config editor не вынесены в отдельные UI-панели, но state и payload для них уже поддерживаются.
- Поскольку исходного source-кода не было, часть UX переосмыслена, а не «патчена поверх исходников».

## Какие проблемы были найдены в исходной сборке

По собранному бандлу были видны следующие архитектурные проблемы:
- бизнес-логика, UI и локальная персистентность тесно смешаны;
- приложение целиком завязано на `localStorage`;
- отсутствует remote source-of-truth для шаринга;
- нет отдельного слоя для shared snapshot versioning;
- форма редактирования и доменный state недостаточно разделены;
- импорт / экспорт и расчётные функции не изолированы как отдельные сервисы;
- в production bundle сложно безопасно развивать код без reconstruct/refactor.

## Следующий логичный шаг

Если захотите довести проект до полноценной CI-friendly версии, следующий этап — перенести этот buildless refactor на Vite + TypeScript + tests, сохранив ту же файловую архитектуру и те же pure functions.
